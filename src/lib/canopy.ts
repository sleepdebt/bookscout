const CANOPY_BASE = 'https://rest.canopyapi.co/api/amazon/product'

export interface CanopyProduct {
  asin: string
  title: string
  brand: string | null
  price: { value: number; currency: string; displayString: string } | null
  rating: number | null
  ratingsTotal: number | null
  salesRank: number | null
  amazonIsSeller: boolean | null
  availability: { status: string; displayString: string } | null
  link: string | null
}

// Raw response from Canopy — superset of CanopyProduct, stored as-is in amazon_data
export type CanopyRawResponse = Record<string, unknown>

function buildHeaders(): HeadersInit {
  const key = process.env.CANOPY_API_KEY
  if (!key) throw new Error('CANOPY_API_KEY is not set')
  return { Authorization: `Bearer ${key}`, 'API-KEY': key }
}

function parseResponse(raw: CanopyRawResponse): CanopyProduct {
  // Canopy wraps the product under data.amazonProduct
  const p = (raw.data as { amazonProduct?: CanopyRawResponse } | undefined)?.amazonProduct ?? raw

  const priceRaw = p.price as { value?: number; currency?: string; display?: string; displayString?: string } | null

  // Amazon is the seller if sellerId matches Amazon's known ID or name contains "Amazon"
  const seller = p.seller as { sellerId?: string; name?: string } | null
  const amazonIsSeller =
    seller?.sellerId === 'ATVPDKIKX0DER' ||
    (seller?.name?.toLowerCase().includes('amazon') ?? false)

  return {
    asin: p.asin as string,
    title: p.title as string,
    brand: (p.brand as string | null) ?? null,
    price: priceRaw?.value != null
      ? {
          value: priceRaw.value,
          currency: priceRaw.currency ?? 'USD',
          displayString: priceRaw.display ?? priceRaw.displayString ?? `$${priceRaw.value}`,
        }
      : null,
    rating: (p.rating as number | null) ?? null,
    ratingsTotal: (p.ratingsTotal as number | null) ?? null,
    salesRank: (p.salesRank as number | null) ?? null,
    amazonIsSeller,
    availability: {
      status: (p.isInStock as boolean) ? 'IN_STOCK' : 'OUT_OF_STOCK',
      displayString: (p.isInStock as boolean) ? 'In Stock' : 'Out of Stock',
    },
    link: (p.url as string | null) ?? null,
  }
}

async function fetchProduct(
  params: Record<string, string>
): Promise<{ product: CanopyProduct; raw: CanopyRawResponse } | null> {
  const url = new URL(CANOPY_BASE)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)

  const res = await fetch(url.toString(), { headers: buildHeaders() })

  if (res.status === 404) return null
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Canopy API error ${res.status}: ${body}`)
  }

  const raw = (await res.json()) as CanopyRawResponse
  return { product: parseResponse(raw), raw }
}

export async function lookupByISBN(
  isbn: string
): Promise<{ product: CanopyProduct; raw: CanopyRawResponse } | null> {
  return fetchProduct({ gtin: isbn })
}

export async function lookupByASIN(
  asin: string
): Promise<{ product: CanopyProduct; raw: CanopyRawResponse } | null> {
  return fetchProduct({ asin })
}
