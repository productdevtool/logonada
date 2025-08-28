'use server';

export interface IconifySearchResponse {
    icons: {
        icon_id: number;
        raster_sizes: {
            size: number;
            formats: {
                format: string;
                preview_url: string;
            }[];
        }[];
        vector_sizes: {
            size: number;
            formats: {
                format: string;
                download_url: string;
            }[];
        }[];
    }[];
    total_count: number;
}


export async function searchIconsAction(query: string): Promise<IconifySearchResponse> {
    if (!query) {
        return { icons: [], total_count: 0 };
    }

    const params = new URLSearchParams({
        query: query,
        count: '50',
        premium: 'false',
        vector: 'true',
        license: 'commercial-nonattribution',
    });

    const response = await fetch(`https://api.iconfinder.com/v4/icons/search?${params.toString()}`, {
        headers: {
            'Authorization': `Bearer ${process.env.ICONFINDER_API_KEY}`,
            'accept': 'application/json'
        },
        next: {
            revalidate: 3600 // Cache for 1 hour
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Iconfinder API Error:', errorText);

        // Don't throw for server errors, just return empty state so the app doesn't crash.
        if (response.status >= 500) {
            return { icons: [], total_count: 0 };
        }
        
        throw new Error('Failed to fetch icons from Iconfinder.');
    }

    return response.json();
}

export async function getIconSvgAction(url: string): Promise<string> {
    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${process.env.ICONFINDER_API_KEY}`,
            'accept': 'application/json'
        },
    });
    if (!response.ok) {
        throw new Error('Failed to fetch SVG content from Iconfinder.');
    }
    return response.text();
}
