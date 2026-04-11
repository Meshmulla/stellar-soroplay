'use client'

export default function QuickTips() {
  const tips = [
    {
      title: 'Getting Started',
      items: [
        'Click "Examples" to load sample contracts',
        'Write or paste your Rust contract code',
        'Click "Compile" to validate and compile',
      ],
    },
    {
      title: 'Contract Structure',
      items: [
        'Use #[soroban_contract] attribute on module',
        'Use #[contractimpl] on impl blocks',
        'Public functions are contract entry points',
        'Env parameter required for storage/logging',
      ],
    },
    {
      title: 'Testing',
      items: [
        'Compile your contract first',
        'Use "Invoke Functions" to test methods',
        'Pass parameters as required by function signature',
        'View execution results in the output pane',
      ],
    },
  ]

  return (
    <div className="max-h-96 overflow-y-auto space-y-4 p-4">
      {tips.map((tip) => (
        <div key={tip.title} className="rounded-lg border border-border bg-card/50 p-3">
          <h4 className="font-semibold text-sm mb-2">{tip.title}</h4>
          <ul className="space-y-1">
            {tip.items.map((item, idx) => (
              <li key={idx} className="text-xs text-muted-foreground flex gap-2">
                <span className="text-primary">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div className="rounded-lg border border-border/50 bg-primary/5 p-3 mt-4">
        <p className="text-xs text-muted-foreground">
          <strong>Tip:</strong> This is a learning environment. Start with the "Hello World" example and modify it to experiment with Soroban smart contracts.
        </p>
      </div>
    </div>
  )
}
