"""Verify the vendored skill inventory without network access."""
import hashlib
import json
from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]
manifest = json.loads((root / 'skills-provenance.json').read_text(encoding='utf-8'))
expected = manifest['files']
actual = {p.relative_to(root).as_posix() for p in (root / '.agents/skills').rglob('*') if p.is_file()}
assert actual == set(expected), 'Skill file inventory differs'
for name, digest in expected.items():
    p = root / name
    assert not p.is_symlink(), name
    assert hashlib.sha256(p.read_bytes()).hexdigest() == digest, name
    if p.name == 'SKILL.md':
        body = p.read_text(encoding='utf-8')
        front = body.split('---', 2)[1]
        assert re.search(r'^name: .+', front, re.M), name
        assert re.search(r'^description: .+', front, re.M), name
    if p.suffix == '.md':
        for target in re.findall(r'\]\(([^)]+)\)', p.read_text(encoding='utf-8')):
            if '://' not in target and not target.startswith('#'):
                assert (p.parent / target.split('#')[0]).is_file(), (name, target)
print(f'PASS: {len(actual)} skill files; hashes, metadata, relative links')
