import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  AmbientLight,
  DirectionalLight,
  Group,
  Mesh,
  MeshToonMaterial,
  SphereGeometry,
  CylinderGeometry,
  BoxGeometry,
  Color,
  Vector3,
  Clock,
} from 'three-platformize'
import type { CameraPosition } from '../../types'

const TOOTH_COLOR = new Color(0xfff8f0)
const GUM_COLOR = new Color(0xffb6c1)
const HIGHLIGHT_COLOR = new Color(0x4fc3f7)
const TONGUE_COLOR = new Color(0xff9a9e)

// 区域索引映射到 zone 名称
const ZONE_NAMES = [
  'upper-outer-right',
  'upper-outer-front',
  'upper-outer-left',
  'upper-inner-right',
  'upper-inner-front',
  'upper-inner-left',
  'upper-occlusal',
  'lower-outer-right',
  'lower-outer-front',
  'lower-outer-left',
  'lower-inner-right',
  'lower-inner-front',
  'lower-inner-left',
  'lower-occlusal',
  'tongue',
]

/** 牙齿区域数据：存储对牙齿 Mesh 的引用 */
interface TeethZoneData {
  type: 'teeth'
  teethRefs: Mesh[]
}

/** 舌头区域数据：直接使用 Group（children 即舌头 Mesh） */
interface TongueZoneData {
  type: 'tongue'
  group: Group
}

type ZoneData = TeethZoneData | TongueZoneData

export class ToothSceneManager {
  private scene: Scene
  private camera: PerspectiveCamera
  private renderer: WebGLRenderer
  private zones: Map<string, ZoneData> = new Map()
  private clock: Clock
  private animationId = 0
  private highlightedZone: string | null = null
  private pulseTime = 0
  private targetCameraPos: Vector3 | null = null
  private targetLookAt: Vector3 | null = null
  private disposed = false

  // canvas 来自微信小程序 SelectorQuery，无公开类型
  constructor(canvas: unknown, width: number, height: number) {
    this.clock = new Clock()

    // 渲染器
    this.renderer = new WebGLRenderer({
      canvas: canvas as OffscreenCanvas,
      antialias: true,
      alpha: true,
    })
    const dpr = Math.min(2, typeof wx !== 'undefined' ? wx.getSystemInfoSync().pixelRatio : 2)
    this.renderer.setPixelRatio(dpr)
    this.renderer.setSize(width, height)
    this.renderer.setClearColor(0x000000, 0)

    // 场景
    this.scene = new Scene()

    // 相机
    this.camera = new PerspectiveCamera(45, width / height, 0.1, 100)
    this.camera.position.set(0, 0.5, 8)
    this.camera.lookAt(0, 0, 0)

    // 灯光
    const ambient = new AmbientLight(0xffffff, 0.6)
    this.scene.add(ambient)
    const dirLight = new DirectionalLight(0xffffff, 0.8)
    dirLight.position.set(5, 5, 5)
    this.scene.add(dirLight)
    const backLight = new DirectionalLight(0xffffff, 0.3)
    backLight.position.set(-3, -2, -5)
    this.scene.add(backLight)

    this.buildTeeth()
    this.animate()
  }

  private buildTeeth() {
    // === 上排牙齿 ===
    const upperJaw = new Group()
    upperJaw.position.y = 0.5

    const upperGum = this.createGum(0.3)
    upperJaw.add(upperGum)

    const upperTeeth = this.createToothRow(1)
    upperJaw.add(upperTeeth)

    this.scene.add(upperJaw)

    // === 下排牙齿 ===
    const lowerJaw = new Group()
    lowerJaw.position.y = -0.5

    const lowerGum = this.createGum(-0.3)
    lowerJaw.add(lowerGum)

    const lowerTeeth = this.createToothRow(-1)
    lowerJaw.add(lowerTeeth)

    this.scene.add(lowerJaw)

    // === 舌头 ===
    const tongueGroup = new Group()
    const tongueMat = new MeshToonMaterial({ color: TONGUE_COLOR })
    const tongueGeo = new SphereGeometry(0.8, 16, 12)
    const tongue = new Mesh(tongueGeo, tongueMat)
    tongue.scale.set(1, 0.3, 1.3)
    tongue.position.set(0, -0.3, 0.2)
    tongueGroup.add(tongue)
    this.scene.add(tongueGroup)
    this.zones.set('tongue', { type: 'tongue', group: tongueGroup })

    // 构建分区
    this.buildZoneGroups(upperTeeth, lowerTeeth)
  }

  private createGum(yOffset: number): Mesh {
    const mat = new MeshToonMaterial({ color: GUM_COLOR })
    const geo = new CylinderGeometry(2.2, 2.2, 0.4, 32, 1, false, 0, Math.PI)
    const gum = new Mesh(geo, mat)
    gum.rotation.x = Math.PI / 2
    gum.rotation.z = yOffset > 0 ? 0 : Math.PI
    gum.position.y = yOffset
    return gum
  }

  private createToothRow(direction: number): Group {
    const row = new Group()
    const toothCount = 14
    const arcRadius = 1.8
    const startAngle = 0
    const endAngle = Math.PI

    for (let i = 0; i < toothCount; i++) {
      const t = i / (toothCount - 1)
      const angle = startAngle + t * endAngle
      const x = Math.cos(angle) * arcRadius
      const z = Math.sin(angle) * arcRadius * 0.5

      const mat = new MeshToonMaterial({ color: TOOTH_COLOR.clone() })

      // 门牙更窄、臼齿更宽
      const isFront = i >= 5 && i <= 8
      const width = isFront ? 0.2 : 0.28
      const height = isFront ? 0.6 : 0.5
      const depth = isFront ? 0.2 : 0.3

      const geo = new BoxGeometry(width, height, depth, 1, 1, 1)
      const tooth = new Mesh(geo, mat)
      tooth.position.set(x, direction * 0.1, z)

      // 让牙齿朝向弧形中心
      tooth.lookAt(0, direction * 0.1, 0)

      row.add(tooth)
    }

    return row
  }

  private buildZoneGroups(upperTeeth: Group, lowerTeeth: Group) {
    const upperChildren = upperTeeth.children as Mesh[]
    const lowerChildren = lowerTeeth.children as Mesh[]

    // 上外侧
    this.createZoneFromTeeth('upper-outer-right', upperChildren.slice(0, 4))
    this.createZoneFromTeeth('upper-outer-front', upperChildren.slice(4, 10))
    this.createZoneFromTeeth('upper-outer-left', upperChildren.slice(10, 14))

    // 上内侧（同一组牙齿，不同视角）
    this.createZoneFromTeeth('upper-inner-right', upperChildren.slice(0, 4))
    this.createZoneFromTeeth('upper-inner-front', upperChildren.slice(4, 10))
    this.createZoneFromTeeth('upper-inner-left', upperChildren.slice(10, 14))

    // 上咬合面
    this.createZoneFromTeeth('upper-occlusal', upperChildren)

    // 下外侧
    this.createZoneFromTeeth('lower-outer-right', lowerChildren.slice(0, 4))
    this.createZoneFromTeeth('lower-outer-front', lowerChildren.slice(4, 10))
    this.createZoneFromTeeth('lower-outer-left', lowerChildren.slice(10, 14))

    // 下内侧
    this.createZoneFromTeeth('lower-inner-right', lowerChildren.slice(0, 4))
    this.createZoneFromTeeth('lower-inner-front', lowerChildren.slice(4, 10))
    this.createZoneFromTeeth('lower-inner-left', lowerChildren.slice(10, 14))

    // 下咬合面
    this.createZoneFromTeeth('lower-occlusal', lowerChildren)
  }

  private createZoneFromTeeth(zoneName: string, teeth: Mesh[]) {
    this.zones.set(zoneName, { type: 'teeth', teethRefs: teeth })
  }

  highlightZone(zoneIndex: number) {
    // 恢复之前高亮的区域
    if (this.highlightedZone) {
      const prevZone = this.zones.get(this.highlightedZone)
      if (prevZone) {
        if (prevZone.type === 'teeth') {
          prevZone.teethRefs.forEach((tooth) => {
            ;(tooth.material as MeshToonMaterial).color.copy(TOOTH_COLOR)
            tooth.scale.setScalar(1)
          })
        } else {
          prevZone.group.children.forEach((child) => {
            ;((child as Mesh).material as MeshToonMaterial).color.copy(TONGUE_COLOR)
            child.scale.set(1, 0.3, 1.3)
          })
        }
      }
    }

    const zoneName = ZONE_NAMES[zoneIndex]
    if (!zoneName) return
    this.highlightedZone = zoneName
    this.pulseTime = 0
  }

  rotateToZone(cameraPos: CameraPosition) {
    this.targetCameraPos = new Vector3(cameraPos.x, cameraPos.y, cameraPos.z)
    this.targetLookAt = new Vector3(0, cameraPos.lookAtY, 0)
  }

  private animate = () => {
    if (this.disposed) return
    this.animationId = requestAnimationFrame(this.animate)

    const delta = this.clock.getDelta()
    this.pulseTime += delta

    // 高亮脉动
    if (this.highlightedZone) {
      const zone = this.zones.get(this.highlightedZone)
      if (zone) {
        const pulse = 1 + Math.sin(this.pulseTime * 4) * 0.05

        if (zone.type === 'teeth') {
          zone.teethRefs.forEach((tooth) => {
            ;(tooth.material as MeshToonMaterial).color.copy(HIGHLIGHT_COLOR)
            tooth.scale.setScalar(pulse)
          })
        } else {
          zone.group.children.forEach((child) => {
            ;((child as Mesh).material as MeshToonMaterial).color.copy(HIGHLIGHT_COLOR)
            child.scale.set(pulse, 0.3 * pulse, 1.3 * pulse)
          })
        }
      }
    }

    // 平滑移动相机
    if (this.targetCameraPos) {
      this.camera.position.lerp(this.targetCameraPos, delta * 3)
      if (this.camera.position.distanceTo(this.targetCameraPos) < 0.01) {
        this.camera.position.copy(this.targetCameraPos)
        this.targetCameraPos = null
      }
    }

    if (this.targetLookAt) {
      const currentLookAt = new Vector3()
      this.camera.getWorldDirection(currentLookAt)
      this.camera.lookAt(this.targetLookAt)
    }

    this.renderer.render(this.scene, this.camera)
  }

  resize(width: number, height: number) {
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height)
  }

  dispose() {
    this.disposed = true
    if (this.animationId) cancelAnimationFrame(this.animationId)
    this.renderer.dispose()
    this.scene.traverse((obj) => {
      if (obj instanceof Mesh) {
        obj.geometry.dispose()
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose())
        } else {
          obj.material.dispose()
        }
      }
    })
  }
}
