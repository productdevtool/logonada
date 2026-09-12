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
        premium: '0',
        vector: '1',
    });

    try {
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
            console.error('Iconfinder Search API Error:', {
                status: response.status,
                statusText: response.statusText,
                body: errorText,
                query: query
            });

            if (response.status >= 500) {
                return { icons: [], total_count: 0 };
            }
            
            throw new Error(`Failed to fetch icons: ${response.statusText}`);
        }

        const data = await response.json();
        return data as IconifySearchResponse;
    } catch (error) {
        console.error('Search Icons Action Exception:', error);
        return { icons: [], total_count: 0 };
    }
}

export async function getIconSvgAction(url: string): Promise<string> {
    if (!url) return '';

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${process.env.ICONFINDER_API_KEY}`,
                'accept': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Iconfinder SVG Fetch Error:', {
                status: response.status,
                url: url,
                body: errorText
            });
            throw new Error('Failed to fetch SVG content from Iconfinder.');
        }

        return await response.text();
    } catch (error) {
        console.error('Get Icon SVG Action Exception:', error);
        throw error;
    }
}
