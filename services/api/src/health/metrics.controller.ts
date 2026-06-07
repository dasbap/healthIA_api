import { Controller, Get, Header } from '@nestjs/common';

import { MetricsService } from '../common/metrics.service';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metrics: MetricsService) {}

  @Get()
  @Header('content-type', 'text/plain; version=0.0.4')
  metricsText() {
    return this.metrics.render();
  }
}
