import { CommandFactory } from 'nest-commander'
import { AppModule } from './app'

async function bootstrap() {
  await CommandFactory.run(AppModule, ['error', 'warn'])
}

void bootstrap()
