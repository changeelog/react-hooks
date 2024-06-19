import { renderHook, act } from '@testing-library/react';
import { useClipboardItems } from '../useClipboardItems';

const ClipboardItem = jest.fn();

describe('useClipboardItems', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return isSupported as true when navigator.clipboard.write is available', () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        write: jest.fn(),
      },
      writable: true,
    });

    const { result } = renderHook(() => useClipboardItems());
    expect(result.current.isSupported).toBe(true);
  });

  it('should return isSupported as false when navigator.clipboard.write is not available', () => {
    const originalClipboard = navigator.clipboard;
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      writable: true,
    });

    const { result } = renderHook(() => useClipboardItems());
    expect(result.current.isSupported).toBe(false);
    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      writable: true,
    });
  });

  it('should set content and copied state when copy is called with source', async () => {
    const source = [
      new ClipboardItem({
        'text/plain': new Blob(['Hello, World!'], { type: 'text/plain' }),
      }),
    ];
    const { result } = renderHook(() => useClipboardItems({ source }));
    await act(async () => {
      await result.current.copy(source);
    });
    expect(result.current.content).toEqual(source);
    expect(result.current.copied).toBe(true);
  });

  it('should reset copied state after copiedDuring time', async () => {
    const source = [
      new ClipboardItem({
        'text/plain': new Blob(['Hello, World!'], { type: 'text/plain' }),
      }),
    ];
    const copiedDuring = 1000;
    const { result } = renderHook(() =>
      useClipboardItems({ source, copiedDuring })
    );
    await act(async () => {
      await result.current.copy(source);
    });
    expect(result.current.copied).toBe(true);
    act(() => {
      jest.advanceTimersByTime(copiedDuring);
    });
    expect(result.current.copied).toBe(false);
  });

  it('should not set content and copied state when copy is called without source', async () => {
    const { result } = renderHook(() => useClipboardItems());
    await act(async () => {
      await result.current.copy([]);
    });
    expect(result.current.content).toBeNull();
    expect(result.current.copied).toBe(false);
  });

  it('should read clipboard content when read option is true', async () => {
    const clipboardContent = [
      new ClipboardItem({
        'text/plain': new Blob(['Hello, World!'], { type: 'text/plain' }),
      }),
    ];
    Object.assign(navigator.clipboard, {
      read: jest.fn().mockResolvedValue(clipboardContent),
    });
    const { result } = renderHook(() => useClipboardItems({ read: true }));
    expect(navigator.clipboard.read).toHaveBeenCalled();
    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current.content).toEqual(clipboardContent);
  });
});
