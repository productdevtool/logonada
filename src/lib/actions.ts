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

    const apiKey = process.env.ICONFINDER_API_KEY;
    if (!apiKey) {
        console.error('ICONFINDER_API_KEY is not set in environment variables.');
        return { icons: [], total_count: 0 };
    }

    const params = new URLSearchParams({
        query: query,
        count: '50',
        premium: '0',
    });

    try {
        const response = await fetch(`https://api.iconfinder.com/v4/icons/search?${params.toString()}`, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Accept': 'application/json'
            },
            next: {
                revalidate: 3600 // Cache for 1 hour
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Iconfinder Search API Error:', response.status, errorText);
            return { icons: [], total_count: 0 };
        }

        const data = await response.json();
        
        // Filter icons to ensure we only return ones that have at least one SVG format for the canvas
        if (data.icons && Array.isArray(data.icons)) {
            data.icons = data.icons.filter((icon: any) => 
                icon.vector_sizes && icon.vector_sizes.some((vs: any) => 
                    vs.formats && vs.formats.some((f: any) => f.format === 'svg')
                )
            );
        }

        return data as IconifySearchResponse;
    } catch (error) {
        console.error('Search Icons Action Exception:', error);
        return { icons: [], total_count: 0 };
    }
}

export async function getIconSvgAction(url: string): Promise<string> {
    if (!url) return '';

    const apiKey = process.env.ICONFINDER_API_KEY;
    if (!apiKey) {
        throw new Error('ICONFINDER_API_KEY is missing');
    }

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Iconfinder SVG Fetch Error:', response.status, url, errorText);
            throw new Error(`Failed to fetch SVG: ${response.statusText}`);
        }

        return await response.text();
    } catch (error) {
        console.error('Get Icon SVG Action Exception:', error);
        throw error;
    }
}
