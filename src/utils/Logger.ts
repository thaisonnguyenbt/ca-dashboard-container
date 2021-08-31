import { debug as logger } from 'debug';
import { LogLevel, PromiseStatus } from './Enums';

const LOG_WARN_PREFIX = '*** WARN ***';
const LOG_ERROR_PREFIX = '***** ERROR *****';

const isTraceEnabled = process.env.DEBUG?.includes(LogLevel.TRACE);
const isDebugEnabled = process.env.DEBUG?.includes(LogLevel.DEBUG);
const isInfoEnabled = process.env.DEBUG?.includes(LogLevel.INFO);
const isWarnEnabled = process.env.DEBUG?.includes(LogLevel.WARN);
const isErrorEnabled = process.env.DEBUG?.includes(LogLevel.ERROR);
const isFatalEnabled = process.env.DEBUG?.includes(LogLevel.FATAL);

const traceLog = logger(LogLevel.TRACE);
const debugLog = logger(LogLevel.DEBUG);
const infoLog = logger(LogLevel.INFO);
const warnLog = logger(LogLevel.WARN);
const errorLog = logger(LogLevel.ERROR);
const fatalLog = logger(LogLevel.FATAL);

const LOG = {
  trace: (...args: any) => {
    if (isTraceEnabled) {
      traceLog(customStringify([...args]));
    }
  },

  debug: (...args: any) => {
    if (isDebugEnabled) {
      debugLog(customStringify([...args]));
    }
  },

  info: (...args: any) => {
    if (isInfoEnabled) {
      infoLog(customStringify([...args]));
    }
  },

  warn: (...args: any) => {
    if (isWarnEnabled) {
      warnLog(customStringify([LOG_WARN_PREFIX, ...args]));
    }
  },

  error: (...args: any) => {
    if (isErrorEnabled) {
      errorLog(customStringify([LOG_ERROR_PREFIX, ...args]));
    }
  },

  fatal: (...args: any) => {
    if (isFatalEnabled) {
      fatalLog(customStringify([...args]));
    }
  },
};

export default LOG;

/**
 * Since the Formatters %o %O %j in npm debug package can't log nested array of object. got [object, object]
 *
 * This is the custome stringify to print out full json object
 *
 * @param args
 *    logs parameters array
 * @returns string of the combined objects
 */
const customStringify = (args: Array<any>): string => {
  const arrOfStrings = args.map((arg) => {
    if (typeof arg === 'string') {
      return arg;
    }

    if (Array.isArray(arg)) {
      arg.forEach((item) => {
        if (item.status === PromiseStatus.REJECTED && item.reason instanceof Error) {
          item.reason = item.reason.stack;
        }
      });
    } else if (typeof arg === 'object') {
      if (arg.status === PromiseStatus.REJECTED && arg.reason instanceof Error) {
        arg.reason = arg.reason.stack;
      }
    }
    return JSON.stringify(arg);
  });
  return arrOfStrings.join(' ');
};
