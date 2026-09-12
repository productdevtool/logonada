'use client'
import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, Suspense } from 'react'

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    capture_pageview: false, // We handle pageviews manually below
    capture_performance: false, // Resolves "web vitals callbacks not loaded" console error
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') posthog.debug()
    }
  })
}

function PostHogPageviewComponent(): JSX.Element {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (pathname) {
            let url = window.origin + pathname
            if (searchParams && searchParams.toString()) {
                url = url + `?${searchParams.toString()}`
            }
            posthog.capture(
                '$pageview',
                {
                    '$current_url': url,
                }
            )
        }
    }, [pathname, searchParams])

    return <></>
}

export function PostHogPageview(): JSX.Element {
    return (
        <Suspense fallback={null}>
            <PostHogPageviewComponent />
        </Suspense>
    )
}

export function PostHogProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return <PHProvider client={posthog}>{children}</PHProvider>
}

export function CSPostHogProvider({ children }: { children: React.ReactNode }) {
    return <PHProvider client={posthog}>
        <PostHogPageview />
        {children}
    </PHProvider>
}
