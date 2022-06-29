import { Config, Configuration, Inject } from '@midwayjs/decorator';
import * as DefaultConfig from './config/config.default';
import { MidwayApplicationManager } from '@midwayjs/core';
import { CodeDyeMW } from './middleware';
import { codeDye } from './codeDye';
@Configuration({
  namespace: 'code-dye',
  importConfigs: [
    {
      default: DefaultConfig,
    },
  ],
})
export class CodeDyeConfiguration {
  @Inject()
  applicationManager: MidwayApplicationManager;

  @Config()
  codeDye;

  async onReady(container) {
    this.applicationManager
      .getApplications(['koa', 'faas', 'express', 'egg'])
      .forEach(app => {
        app.getMiddleware().insertFirst(CodeDyeMW);
      });
    // 将ioc内的代码进行包裹
    for(const [key, value] of container.registry) {
      if (!value?.path || !value.srcPath) {
        continue;
      }
      value.path = codeDye(value.path, [value.srcPath || key]);
      container.registry[key] =value;
    }
  }
}
