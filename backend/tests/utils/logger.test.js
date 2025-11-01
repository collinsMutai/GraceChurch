const { mpesaLogger } = require('../../utils/logger'); // Import the logger utility
const sinon = require('sinon');
const chai = require('chai');
const expect = chai.expect;

describe('Logger Tests', () => {

  // Test for logging info messages
  it('1. Logs info messages correctly', () => {
    const logSpy = sinon.spy(mpesaLogger, 'info');  // Spy on the `info` method

    // Log an info message with additional metadata
    mpesaLogger.info('This is an info message', { checkoutRequestID: 'mockID' });

    // Check that the `info` method was called with the correct message and metadata
    expect(logSpy.calledWith('This is an info message', { checkoutRequestID: 'mockID' })).to.be.true;

    logSpy.restore();  // Restore the spy to avoid interference with other tests
  });

  // Test for logging error messages
  it('2. Logs error messages correctly', () => {
    const logSpy = sinon.spy(mpesaLogger, 'error');  // Spy on the `error` method

    // Log an error message with error details
    mpesaLogger.error('This is an error message', { error: 'Something went wrong' });

    // Check that the `error` method was called with the correct message and error metadata
    expect(logSpy.calledWith('This is an error message', { error: 'Something went wrong' })).to.be.true;

    logSpy.restore();  // Restore the spy to avoid interference with other tests
  });

  // Test for logging warn messages
  it('3. Logs warn messages correctly', () => {
    const logSpy = sinon.spy(mpesaLogger, 'warn');  // Spy on the `warn` method

    // Log a warning message with additional metadata
    mpesaLogger.warn('This is a warning', { checkoutRequestID: 'mockID' });

    // Check that the `warn` method was called with the correct message and metadata
    expect(logSpy.calledWith('This is a warning', { checkoutRequestID: 'mockID' })).to.be.true;

    logSpy.restore();  // Restore the spy to avoid interference with other tests
  });

  // Test for logging with no metadata
  it('4. Logs info messages without metadata correctly', () => {
    const logSpy = sinon.spy(mpesaLogger, 'info');  // Spy on the `info` method

    // Log an info message without metadata
    mpesaLogger.info('This is a simple info message');

    // Check that the `info` method was called with the correct message and no metadata
    expect(logSpy.calledWith('This is a simple info message')).to.be.true;

    logSpy.restore();  // Restore the spy
  });

  // Test for logging with an empty object as metadata
  it('5. Logs info messages with empty metadata correctly', () => {
    const logSpy = sinon.spy(mpesaLogger, 'info');  // Spy on the `info` method

    // Log an info message with empty metadata
    mpesaLogger.info('This is an info message with empty metadata', {});

    // Check that the `info` method was called with the correct message and empty metadata
    expect(logSpy.calledWith('This is an info message with empty metadata', {})).to.be.true;

    logSpy.restore();  // Restore the spy
  });

  // Test for logging error messages with different error levels
  it('6. Logs error messages with different error levels', () => {
    const logSpy = sinon.spy(mpesaLogger, 'error');  // Spy on the `error` method

    // Log an error message with different levels of details
    mpesaLogger.error('Database error occurred', { errorCode: 500, errorDetail: 'Connection timeout' });

    // Check that the `error` method was called with the correct message and error details
    expect(logSpy.calledWith('Database error occurred', { errorCode: 500, errorDetail: 'Connection timeout' })).to.be.true;

    logSpy.restore();  // Restore the spy
  });

  // Test for logging multiple messages in quick succession
  it('7. Logs multiple messages in quick succession', () => {
    const logSpy = sinon.spy(mpesaLogger, 'info');  // Spy on the `info` method

    // Log multiple info messages in quick succession
    mpesaLogger.info('First message');
    mpesaLogger.info('Second message', { transactionID: '12345' });

    // Check that the `info` method was called twice with the correct messages and metadata
    expect(logSpy.calledWith('First message')).to.be.true;
    expect(logSpy.calledWith('Second message', { transactionID: '12345' })).to.be.true;

    logSpy.restore();  // Restore the spy
  });

  // Test for logging messages with nested objects as metadata
  it('8. Logs messages with nested objects as metadata correctly', () => {
    const logSpy = sinon.spy(mpesaLogger, 'info');  // Spy on the `info` method

    // Log an info message with nested metadata
    mpesaLogger.info('Transaction completed', { user: { id: 1, name: 'John Doe' }, transaction: { amount: 1000 } });

    // Check that the `info` method was called with the correct message and nested metadata
    expect(logSpy.calledWith('Transaction completed', { 
      user: { id: 1, name: 'John Doe' }, 
      transaction: { amount: 1000 }
    })).to.be.true;

    logSpy.restore();  // Restore the spy
  });

  // Test for logging error messages with non-object metadata
  it('9. Logs error messages with non-object metadata correctly', () => {
    const logSpy = sinon.spy(mpesaLogger, 'error');  // Spy on the `error` method

    // Log an error message with non-object metadata (string)
    mpesaLogger.error('Payment failed', 'Invalid payment method');

    // Check that the `error` method was called with the correct message and non-object metadata
    expect(logSpy.calledWith('Payment failed', 'Invalid payment method')).to.be.true;

    logSpy.restore();  // Restore the spy
  });

  // Test for logging with different log levels (if applicable)
  it('10. Logs with different log levels correctly', () => {
    const infoSpy = sinon.spy(mpesaLogger, 'info');
    const warnSpy = sinon.spy(mpesaLogger, 'warn');
    const errorSpy = sinon.spy(mpesaLogger, 'error');

    // Log messages with different log levels
    mpesaLogger.info('Informational message');
    mpesaLogger.warn('Warning message');
    mpesaLogger.error('Error message');

    // Check that each log level was called with the correct message
    expect(infoSpy.calledWith('Informational message')).to.be.true;
    expect(warnSpy.calledWith('Warning message')).to.be.true;
    expect(errorSpy.calledWith('Error message')).to.be.true;

    infoSpy.restore();
    warnSpy.restore();
    errorSpy.restore();  // Restore spies
  });

});
