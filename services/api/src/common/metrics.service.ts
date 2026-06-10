import { Injectable } from '@nestjs/common';

type RouteKey = string;

@Injectable()
export class MetricsService {
  private readonly counters = new Map<RouteKey, number>();
  private readonly durations = new Map<RouteKey, number[]>();

  record(route: string, method: string, statusCode: number, durationMs: number): void {
    const labels = `method="${method}",route="${route}",status="${statusCode}"`;
    this.counters.set(labels, (this.counters.get(labels) ?? 0) + 1);

    const durationKey = `method="${method}",route="${route}"`;
    const values = this.durations.get(durationKey) ?? [];
    values.push(durationMs);
    if (values.length > 1000) {
      values.shift();
    }
    this.durations.set(durationKey, values);
  }

  render(): string {
    const lines = [
      '# HELP http_requests_total Total HTTP requests.',
      '# TYPE http_requests_total counter',
    ];

    for (const [labels, value] of this.counters.entries()) {
      lines.push(`http_requests_total{${labels}} ${value}`);
    }

    lines.push(
      '# HELP http_request_duration_ms Average HTTP request duration in milliseconds.',
      '# TYPE http_request_duration_ms gauge',
    );

    for (const [labels, values] of this.durations.entries()) {
      const average = values.reduce((sum, value) => sum + value, 0) / values.length;
      lines.push(`http_request_duration_ms{${labels}} ${average.toFixed(3)}`);
    }

    return `${lines.join('\n')}\n`;
  }
}
