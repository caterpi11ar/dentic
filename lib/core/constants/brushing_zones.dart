/// Brushing zones following the Bass Method.
///
/// The mouth is divided into zones covering:
/// - Outer (labial/buccal) surfaces
/// - Inner (lingual/palatal) surfaces
/// - Occlusal (chewing) surfaces
enum BrushingZone {
  upperRightOuter('Upper Right Outer', '右上外侧'),
  upperFrontOuter('Upper Front Outer', '上前外侧'),
  upperLeftOuter('Upper Left Outer', '左上外侧'),
  lowerLeftOuter('Lower Left Outer', '左下外侧'),
  lowerFrontOuter('Lower Front Outer', '下前外侧'),
  lowerRightOuter('Lower Right Outer', '右下外侧'),
  upperRightInner('Upper Right Inner', '右上内侧'),
  upperFrontInner('Upper Front Inner', '上前内侧'),
  upperLeftInner('Upper Left Inner', '左上内侧'),
  lowerLeftInner('Lower Left Inner', '左下内侧'),
  lowerFrontInner('Lower Front Inner', '下前内侧'),
  lowerRightInner('Lower Right Inner', '右下内侧'),
  upperOcclusal('Upper Occlusal', '上咬合面'),
  lowerOcclusal('Lower Occlusal', '下咬合面');

  const BrushingZone(this.labelEn, this.labelZh);

  final String labelEn;
  final String labelZh;
}
