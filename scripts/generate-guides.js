const fs = require('fs').promises;
const path = require('path');

async function generateGuidesData() {
  // Dynamically import ES Modules
  const { remark } = await import('remark');
  const { default: html } = await import('remark-html');

  const guidesMetadata = [
    { slug: 'basic-understanding', title: '롤 밴픽의 기본 이해: 왜 중요한가?', date: '2025-08-15' },
    { slug: 'advanced-strategy', title: '페어리스 밴픽 심화 전략: 챔피언 풀 관리', date: '2025-08-16' },
  ];

  const guidesDirectory = path.join(process.cwd(), 'src', 'guides');
  const outputFilePath = path.join(process.cwd(), 'src', 'data', 'guides.json');

  try {
    const allGuides = await Promise.all(guidesMetadata.map(async (meta) => {
      const filePath = path.join(guidesDirectory, `${meta.slug}.md`);
      const fileContents = await fs.readFile(filePath, 'utf8');

      const processedContent = await remark().use(html).process(fileContents);
      const contentHtml = processedContent.toString();

      return {
        slug: meta.slug,
        title: meta.title,
        date: meta.date,
        contentHtml: contentHtml,
      };
    }));

    // Sort guides by date in descending order
    const sortedGuides = allGuides.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    await fs.writeFile(outputFilePath, JSON.stringify(sortedGuides, null, 2), 'utf8');
    console.log('Guides data generated successfully!');
  } catch (error) {
    console.error('Error generating guides data:', error);
    process.exit(1); // Exit with error code
  }
}

generateGuidesData();
