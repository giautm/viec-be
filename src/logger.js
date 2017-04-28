import winston from 'winston';

winston.add(winston.transports.File, {
  name: 'error-file',
  filename: 'var/log/system-error.log',
  level: 'error',
});
winston.add(winston.transports.File, {
  name: 'info-file',
  filename: 'var/log/system-info.log',
  level: 'info',
});

if (process.env.NODE_ENV !== 'production') {
  winston.add(winston.transports.File, {
    name: 'debug-file',
    filename: 'var/log/system-debug.log',
    level: 'debug',
  });
}

export const logger = winston;
