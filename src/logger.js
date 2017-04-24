import winston from 'winston';

export default () => {
  winston.add(winston.transports.File, {
    name: 'info-file',
    filename: 'var/log/system-info.log',
    level: 'info',
  });
  winston.add(winston.transports.File, {
    name: 'error-file',
    filename: 'var/log/system-error.log',
    level: 'error',
  });

  if (process.env.NODE_ENV !== 'production') {
    winston.add(winston.transports.File, {
      name: 'debug-file',
      filename: 'var/log/system-debug.log',
      level: 'debug',
    });
  }

  return async (ctx, next) => {
    ctx.logger = winston;
    await next();
  };
};
