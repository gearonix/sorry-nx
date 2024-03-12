#!/usr/bin/env node

import { CommandFactory } from 'nest-commander'
import { AppModule } from '../src/app'

async function bootstrap() {
  await CommandFactory.run(AppModule, ['error', 'warn'])
}

void bootstrap()
