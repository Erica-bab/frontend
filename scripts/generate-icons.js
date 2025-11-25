const fs = require('fs');
const path = require('path');

const ICON_DIR = path.join(__dirname, '../assets/icon');
const OUTPUT_FILE = path.join(__dirname, '../components/Icon.tsx');

function toCamelCase(str) {
  return str
    .replace(/[-_](.)/g, (_, char) => char.toUpperCase())
    .replace(/^(.)/, (_, char) => char.toLowerCase());
}

function toPascalCase(str) {
  const camel = toCamelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

function getSvgFiles(dir, prefix = '') {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // 하위 폴더는 무시 (tabicon 등은 별도 관리)
      continue;
    }

    if (item.endsWith('.svg')) {
      const name = item.replace('.svg', '');
      files.push({
        fileName: item,
        name: name,
        camelName: toCamelCase(name),
        pascalName: toPascalCase(name) + 'Icon',
        importPath: prefix ? `@/assets/icon/${prefix}/${item}` : `@/assets/icon/${item}`,
      });
    }
  }

  return files.sort((a, b) => a.camelName.localeCompare(b.camelName));
}

function generateIconFile() {
  const icons = getSvgFiles(ICON_DIR);

  const imports = icons
    .map((icon) => `import ${icon.pascalName} from '${icon.importPath}';`)
    .join('\n');

  const mappings = icons
    .map((icon) => `  ${icon.camelName}: ${icon.pascalName},`)
    .join('\n');

  const content = `import { SvgProps } from 'react-native-svg';

// 아이콘 import (자동 생성됨 - scripts/generate-icons.js)
${imports}

// 아이콘 매핑
const icons = {
${mappings}
} as const;

export type IconName = keyof typeof icons;

interface IconProps extends SvgProps {
  name: IconName;
  size?: number;
}

export default function Icon({ name, size = 24, width, height, ...props }: IconProps) {
  const IconComponent = icons[name];

  return (
    <IconComponent
      width={width ?? size}
      height={height ?? size}
      {...props}
    />
  );
}
`;

  fs.writeFileSync(OUTPUT_FILE, content);
  console.log(`✓ Icon.tsx 생성 완료 (${icons.length}개 아이콘)`);
  icons.forEach((icon) => console.log(`  - ${icon.camelName}`));
}

generateIconFile();
