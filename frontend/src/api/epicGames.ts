const API_PATH = '/epic-api/account/v2/payment/ajaxGetOrderHistory'

export type FetchProgress = {
  games: string[]   // liste triée cumulée à cet instant
  page: number      // numéro de page courant (1-based)
}

export async function fetchAllGames(
  onProgress: (p: FetchProgress) => void,
  signal: AbortSignal,
): Promise<void> {
  const seen = new Set<string>()
  let nextPageToken: string | null = null
  let page = 0

  do {
    const params = new URLSearchParams({
      count: '1000',
      sortDir: 'DESC',
      sortBy: 'DATE',
      locale: 'en-US',
    })
    if (nextPageToken) params.set('nextPageToken', nextPageToken)

    const res = await fetch(`${API_PATH}?${params}`, {
      signal,
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
    page++

    for (const order of data.orders ?? []) {
      for (const item of order.items ?? []) {
        const name = (item.description as string | undefined)?.trim()
        if (name) seen.add(name)
      }
    }

    nextPageToken = (data.nextPageToken as string | undefined) ?? null

    // Émet les jeux triés dès que la page est prête — l'UI se met à jour immédiatement
    onProgress({
      games: [...seen].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })),
      page,
    })
  } while (nextPageToken)
}
