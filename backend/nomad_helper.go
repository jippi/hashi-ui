package main

import (
	"bytes"
	"io"
	"time"
)

// IntToPtr returns the pointer to an int
func IntToPtr(i int) *int {
	return &i
}

// PtrToInt returns the value of an *int
func PtrToInt(i *int) int {
	return *i
}

// LineLimitReader wraps another reader and provides `tail -n` like behavior.
// LineLimitReader buffers up to the searchLimit and returns `-n` number of
// lines. After those lines have been returned, LineLimitReader streams the
// underlying ReadCloser
type LineLimitReader struct {
	io.ReadCloser
	lines       int
	searchLimit int

	timeLimit time.Duration
	lastRead  time.Time

	buffer     *bytes.Buffer
	bufFiled   bool
	foundLines bool
}

// NewLineLimitReader takes the ReadCloser to wrap, the number of lines to find
// searching backwards in the first searchLimit bytes. timeLimit can optionally
// be specified by passing a non-zero duration. When set, the search for the
// last n lines is aborted if no data has been read in the duration. This
// can be used to flush what is had if no extra data is being received. When
// used, the underlying reader must not block forever and must periodically
// unblock even when no data has been read.
func NewLineLimitReader(r io.ReadCloser, lines, searchLimit int, timeLimit time.Duration) *LineLimitReader {
	return &LineLimitReader{
		ReadCloser:  r,
		searchLimit: searchLimit,
		timeLimit:   timeLimit,
		lines:       lines,
		buffer:      bytes.NewBuffer(make([]byte, 0, searchLimit)),
	}
}

func (l *LineLimitReader) Read(p []byte) (n int, err error) {
	// Fill up the buffer so we can find the correct number of lines.
	if !l.bufFiled {
		b := make([]byte, len(p))
		n, err := l.ReadCloser.Read(b)
		if n > 0 {
			if _, err := l.buffer.Write(b[:n]); err != nil {
				return 0, err
			}
		}

		if err != nil {
			if err != io.EOF {
				return 0, err
			}

			l.bufFiled = true
			goto READ
		}

		if l.buffer.Len() >= l.searchLimit {
			l.bufFiled = true
			goto READ
		}

		if l.timeLimit.Nanoseconds() > 0 {
			if l.lastRead.IsZero() {
				l.lastRead = time.Now()
				return 0, nil
			}

			now := time.Now()
			if n == 0 {
				// We hit the limit
				if l.lastRead.Add(l.timeLimit).Before(now) {
					l.bufFiled = true
					goto READ
				} else {
					return 0, nil
				}
			} else {
				l.lastRead = now
			}
		}

		return 0, nil
	}

READ:
	if l.bufFiled && l.buffer.Len() != 0 {
		b := l.buffer.Bytes()

		// Find the lines
		if !l.foundLines {
			found := 0
			i := len(b) - 1
			sep := byte('\n')
			lastIndex := len(b) - 1
			for ; found < l.lines && i >= 0; i-- {
				if b[i] == sep {
					lastIndex = i

					// Skip the first one
					if i != len(b)-1 {
						found++
					}
				}
			}

			// We found them all
			if found == l.lines {
				// Clear the buffer until the last index
				l.buffer.Next(lastIndex + 1)
			}

			l.foundLines = true
		}

		// Read from the buffer
		n := copy(p, l.buffer.Next(len(p)))
		return n, nil
	}

	// Just stream from the underlying reader now
	return l.ReadCloser.Read(p)
}
