const { mpesaLogger } = require('../../utils/logger');  // Import the logger utility

describe('Logger Tests', () => {

  // Test for logging info messages
  test('1. Logs info messages correctly', () => {
    const logSpy = jest.spyOn(mpesaLogger, 'info');  // Spy on the `info` method

    // Log an info message with additional metadata
    mpesaLogger.info('This is an info message', { checkoutRequestID: 'mockID' });

    // Check that the `info` method was called with the correct message and metadata
    expect(logSpy).toHaveBeenCalledWith('This is an info message', { checkoutRequestID: 'mockID' });

    logSpy.mockRestore();  // Restore the spy to avoid interference with other tests
  });

  // Test for logging error messages
  test('2. Logs error messages correctly', () => {
    const logSpy = jest.spyOn(mpesaLogger, 'error');  // Spy on the `error` method

    // Log an error message with error details
    mpesaLogger.error('This is an error message', { error: 'Something went wrong' });

    // Check that the `error` method was called with the correct message and error metadata
    expect(logSpy).toHaveBeenCalledWith('This is an error message', { error: 'Something went wrong' });

    logSpy.mockRestore();  // Restore the spy to avoid interference with other tests
  });

  // Test for logging warn messages
  test('3. Logs warn messages correctly', () => {
    const logSpy = jest.spyOn(mpesaLogger, 'warn');  // Spy on the `warn` method

    // Log a warning message with additional metadata
    mpesaLogger.warn('This is a warning', { checkoutRequestID: 'mockID' });

    // Check that the `warn` method was called with the correct message and metadata
    expect(logSpy).toHaveBeenCalledWith('This is a warning', { checkoutRequestID: 'mockID' });

    logSpy.mockRestore();  // Restore the spy to avoid interference with other tests
  });

  // Test for logging with no metadata
  test('4. Logs info messages without metadata correctly', () => {
    const logSpy = jest.spyOn(mpesaLogger, 'info');  // Spy on the `info` method

    // Log an info message without metadata
    mpesaLogger.info('This is a simple info message');

    // Check that the `info` method was called with the correct message and no metadata
    expect(logSpy).toHaveBeenCalledWith('This is a simple info message');

    logSpy.mockRestore();  // Restore the spy
  });

  // Test for logging with an empty object as metadata
  test('5. Logs info messages with empty metadata correctly', () => {
    const logSpy = jest.spyOn(mpesaLogger, 'info');  // Spy on the `info` method

    // Log an info message with empty metadata
    mpesaLogger.info('This is an info message with empty metadata', {});

    // Check that the `info` method was called with the correct message and empty metadata
    expect(logSpy).toHaveBeenCalledWith('This is an info message with empty metadata', {});

    logSpy.mockRestore();  // Restore the spy
  });

  // Test for logging error messages with different error levels
  test('6. Logs error messages with different error levels', () => {
    const logSpy = jest.spyOn(mpesaLogger, 'error');  // Spy on the `error` method

    // Log an error message with different levels of details
    mpesaLogger.error('Database error occurred', { errorCode: 500, errorDetail: 'Connection timeout' });

    // Check that the `error` method was called with the correct message and error details
    expect(logSpy).toHaveBeenCalledWith('Database error occurred', { errorCode: 500, errorDetail: 'Connection timeout' });

    logSpy.mockRestore();  // Restore the spy
  });

  // Test for logging multiple messages in quick succession
  test('7. Logs multiple messages in quick succession', () => {
    const logSpy = jest.spyOn(mpesaLogger, 'info');  // Spy on the `info` method

    // Log multiple info messages in quick succession
    mpesaLogger.info('First message');
    mpesaLogger.info('Second message', { transactionID: '12345' });

    // Check that the `info` method was called twice with the correct messages and metadata
    expect(logSpy).toHaveBeenCalledWith('First message');
    expect(logSpy).toHaveBeenCalledWith('Second message', { transactionID: '12345' });

    logSpy.mockRestore();  // Restore the spy
  });

  // Test for logging messages with nested objects as metadata
  test('8. Logs messages with nested objects as metadata correctly', () => {
    const logSpy = jest.spyOn(mpesaLogger, 'info');  // Spy on the `info` method

    // Log an info message with nested metadata
    mpesaLogger.info('Transaction completed', { user: { id: 1, name: 'John Doe' }, transaction: { amount: 1000 } });

    // Check that the `info` method was called with the correct message and nested metadata
    expect(logSpy).toHaveBeenCalledWith('Transaction completed', { 
      user: { id: 1, name: 'John Doe' }, 
      transaction: { amount: 1000 }
    });

    logSpy.mockRestore();  // Restore the spy
  });

  // Test for logging error messages with non-object metadata
  test('9. Logs error messages with non-object metadata correctly', () => {
    const logSpy = jest.spyOn(mpesaLogger, 'error');  // Spy on the `error` method

    // Log an error message with non-object metadata (string)
    mpesaLogger.error('Payment failed', 'Invalid payment method');

    // Check that the `error` method was called with the correct message and non-object metadata
    expect(logSpy).toHaveBeenCalledWith('Payment failed', 'Invalid payment method');

    logSpy.mockRestore();  // Restore the spy
  });

  // Test for logging with different log levels (if applicable)
  test('10. Logs with different log levels correctly', () => {
    const infoSpy = jest.spyOn(mpesaLogger, 'info');
    const warnSpy = jest.spyOn(mpesaLogger, 'warn');
    const errorSpy = jest.spyOn(mpesaLogger, 'error');

    // Log messages with different log levels
    mpesaLogger.info('Informational message');
    mpesaLogger.warn('Warning message');
    mpesaLogger.error('Error message');

    // Check that each log level was called with the correct message
    expect(infoSpy).toHaveBeenCalledWith('Informational message');
    expect(warnSpy).toHaveBeenCalledWith('Warning message');
    expect(errorSpy).toHaveBeenCalledWith('Error message');

    infoSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();  // Restore spies
  });

});
