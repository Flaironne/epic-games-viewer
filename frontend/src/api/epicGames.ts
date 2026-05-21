// Le cookie est injecté côté proxy Vite (vite.config.ts), pas ici.
// Le browser interdit de setter le header Cookie en fetch() — c'est le proxy qui s'en charge.
const API_PATH = '/epic-api/account/v2/payment/ajaxGetOrderHistory'

export async function fetchAllGames(): Promise<string[]> {
  const seen = new Set<string>()
  let nextPageToken: string | null = null

  do {
    const params = new URLSearchParams({
      count: '1000',
      sortDir: 'DESC',
      sortBy: 'DATE',
      locale: 'en-US',
    })
    if (nextPageToken) params.set('nextPageToken', nextPageToken)

    const res = await fetch(`${API_PATH}?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'X-Requested-With': 'XMLHttpRequest',
      },
    })

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`HTTP ${res.status} – ${res.statusText}${body ? `\n${body.slice(0, 200)}` : ''}`)
    }

    const data = await res.json()

    for (const order of data.orders ?? []) {
      for (const item of order.items ?? []) {
        const name = (item.description as string | undefined)?.trim()
        if (name) seen.add(name)
      }
    }

    nextPageToken = (data.nextPageToken as string | undefined) ?? null
  } while (nextPageToken)

  return [...seen].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
}
