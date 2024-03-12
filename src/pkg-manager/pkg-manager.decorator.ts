import { Inject } from '@nestjs/common'
import { PACKAGE_MANAGER } from './pkg-manager.consts'

export const InjectPackageManager = () => Inject(PACKAGE_MANAGER)
