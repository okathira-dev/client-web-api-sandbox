/** Stop every track so browser capture indicators and hardware access end promptly. */
export function stopMediaStream(stream: MediaStream) {
  for (const track of stream.getTracks()) track.stop();
}
