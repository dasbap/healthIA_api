from collections import defaultdict, deque


class Metrics:
    def __init__(self) -> None:
        self.requests: dict[tuple[str, str, int], int] = defaultdict(int)
        self.durations: dict[tuple[str, str], deque[float]] = defaultdict(lambda: deque(maxlen=1000))
        self.ai_fallback_total = 0
        self.ai_recommendation_total = 0
        self.mongo_unavailable_total = 0

    def record_request(self, method: str, route: str, status_code: int, duration_ms: float) -> None:
        self.requests[(method, route, status_code)] += 1
        self.durations[(method, route)].append(duration_ms)

    def render(self) -> str:
        lines = [
            "# HELP http_requests_total Total HTTP requests.",
            "# TYPE http_requests_total counter",
        ]
        for (method, route, status), value in self.requests.items():
            lines.append(
                f'http_requests_total{{method="{method}",route="{route}",status="{status}"}} {value}'
            )

        lines.extend(
            [
                "# HELP http_request_duration_ms Average HTTP request duration in milliseconds.",
                "# TYPE http_request_duration_ms gauge",
            ]
        )
        for (method, route), values in self.durations.items():
            average = sum(values) / len(values)
            lines.append(f'http_request_duration_ms{{method="{method}",route="{route}"}} {average:.3f}')

        lines.extend(
            [
                "# HELP ai_fallback_total Total deterministic AI fallbacks.",
                "# TYPE ai_fallback_total counter",
                f"ai_fallback_total {self.ai_fallback_total}",
                "# HELP ai_recommendation_total Total AI recommendations.",
                "# TYPE ai_recommendation_total counter",
                f"ai_recommendation_total {self.ai_recommendation_total}",
                "# HELP mongo_unavailable_total Total MongoDB unavailable events.",
                "# TYPE mongo_unavailable_total counter",
                f"mongo_unavailable_total {self.mongo_unavailable_total}",
            ]
        )
        return "\n".join(lines) + "\n"


metrics = Metrics()
