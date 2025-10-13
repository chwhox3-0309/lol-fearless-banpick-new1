export async function generateStaticParams() {
  // Return a hardcoded array to remove file-system dependency for this test.
  return [{ slug: 'basic-understanding' }, { slug: 'advanced-strategy' }];
}

// The most basic possible page component.
export default function GuidePage({ params }: { params: { slug: string } }) {
  return (
    <div>
      <h1>Guide Slug (Debug Page)</h1>
      <p>If you see this, the build was successful.</p>
      <p>Slug: {params.slug}</p>
    </div>
  );
}