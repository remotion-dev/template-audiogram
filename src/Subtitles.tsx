import parseSRT, { SubtitleItem } from 'parse-srt';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
	cancelRender,
	continueRender,
	delayRender,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import { ensureFont } from './ensure-font';
import { Word } from './Word';

const useWindowedFrameSubs = (
	src: string,
	options: { windowStart: number; windowEnd: number }
) => {
	const { windowStart, windowEnd } = options;
	const config = useVideoConfig();
	const { fps } = config;

	const parsed = useMemo(() => parseSRT(src), [src]);

	return useMemo(() => {
		return parsed
			.map((item) => {
				const start = Math.floor(item.start * fps);
				const end = Math.floor(item.end * fps);
				return { item, start, end };
			})
			.filter(({ start }) => {
				return start >= windowStart && start <= windowEnd;
			})
			.map<SubtitleItem>(({ item, start, end }) => {
				return {
					...item,
					start,
					end,
				};
			}, []);
	}, [fps, parsed, windowEnd, windowStart]);
};

const ZOOM_MEASURER_SIZE = 10;
export const LINE_HEIGHT = 98;

export const PaginatedSubtitles: React.FC<{
	subtitles: string;
	startFrame: number;
	endFrame: number;
	linesPerPage: number;
	transcriptionColor: string;
}> = ({
	startFrame,
	endFrame,
	subtitles,
	linesPerPage,
	transcriptionColor,
}) => {
	const frame = useCurrentFrame();
	const windowRef = useRef<HTMLDivElement>(null);
	const zoomMeasurer = useRef<HTMLDivElement>(null);
	const [handle] = useState(() => delayRender());
	const [fontHandle] = useState(() => delayRender());
	const [fontLoaded, setFontLoaded] = useState(false);
	const windowedFrameSubs = useWindowedFrameSubs(subtitles, {
		windowStart: startFrame,
		windowEnd: endFrame,
	});

	const [lineOffset, setLineOffset] = useState(0);

	const onlyCurrentSentence = useMemo(() => {
		const indexOfCurrentSentence =
			windowedFrameSubs.findLastIndex((w, i) => {
				const nextWord = windowedFrameSubs[i + 1];

				return (
					nextWord &&
					(w.text.endsWith('?') ||
						w.text.endsWith('.') ||
						w.text.endsWith('!')) &&
					nextWord.start < frame
				);
			}) + 1;

		return windowedFrameSubs.slice(indexOfCurrentSentence);
	}, [frame, windowedFrameSubs]);

	useEffect(() => {
		if (!fontLoaded) {
			return;
		}
		const zoom =
			(zoomMeasurer.current?.getBoundingClientRect().height as number) /
			ZOOM_MEASURER_SIZE;
		const linesRendered =
			(windowRef.current?.getBoundingClientRect().height as number) /
			(LINE_HEIGHT * zoom);
		const linesToOffset = Math.max(0, linesRendered - linesPerPage);
		setLineOffset(linesToOffset);
		continueRender(handle);
	}, [fontLoaded, frame, handle, linesPerPage]);

	useEffect(() => {
		ensureFont()
			.then(() => {
				continueRender(fontHandle);
				setFontLoaded(true);
			})
			.catch((err) => {
				cancelRender(err);
			});
	}, [fontHandle, fontLoaded]);

	const lineSubs = onlyCurrentSentence.filter((word) => {
		return word.start < frame;
	});

	return (
		<div
			style={{
				position: 'relative',
				overflow: 'hidden',
				paddingBottom: '20px',
			}}
		>
			<div
				ref={windowRef}
				style={{
					transform: `translateY(-${lineOffset * LINE_HEIGHT}px)`,
				}}
			>
				{lineSubs.map((item) => (
					<span key={item.id} id={String(item.id)}>
						<Word
							frame={frame}
							item={item}
							transcriptionColor={transcriptionColor}
						/>{' '}
					</span>
				))}
			</div>
			<div
				ref={zoomMeasurer}
				style={{ height: ZOOM_MEASURER_SIZE, width: ZOOM_MEASURER_SIZE }}
			/>
		</div>
	);
};

declare global {
	interface Array<T> {
		findLastIndex(
			predicate: (value: T, index: number, obj: T[]) => unknown,
			thisArg?: unknown
		): number;
	}
}
