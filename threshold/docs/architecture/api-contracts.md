# API Contracts

## Nearby Passages

Input: latitude, longitude, Seuil. Output: eligible curated Passages with straight-line distance. Sorting must be proximity or explicit editorial order, never popularity.

## Location

The client requests foreground permission and coordinates. Denial is a supported state; reverse geocoding is not required for contextual location copy.

## Navigation handoff

Input: destination coordinates/name and optional origin. Open Naver Map or KakaoMap via deep link, then use a web/store fallback when unavailable.

## Dérive persistence target

Create a Dérive, append photo/text observations, then archive it as a Tracé with duration, distance, and step estimate. Validate Flâneur ownership server-side and protect all mutations with RLS.
