import parseSRT, { SubtitleItem } from 'parse-srt';
import React, {
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {
	continueRender,
	delayRender,
	useCurrentFrame,
	useVideoConfig,
	VideoConfig,
} from 'remotion';
import { ensureFont } from './ensure-font';

const useWindowedFrameSubs = (
	src: string,
	options: { windowStart?: number; windowEnd?: number } = {}
) => {
	const { windowStart = -Infinity, windowEnd = Infinity } = options;
	const config = useVideoConfig();
	const { fps } = config;

	return useMemo(() => {
		const subsWithSeconds = parseSRT(src);
		const subsWithFrameNumbers = subsWithSeconds.reduce<SubtitleItem[]>(
			(acc, item) => {
				const start = Math.floor(item.start * fps);
				const end = Math.floor(item.end * fps);

				if (start < windowStart || start > windowEnd) return acc;

				return [
					...acc,
					{
						...item,
						start,
						end,
					},
				];
			},
			[]
		);
		return subsWithFrameNumbers;
	}, [fps, src, windowEnd, windowStart]);
};

export const Subtitles: React.FC<{
	src: string;
	renderSubtitleItem?: (
		item: SubtitleItem,
		frame: number,
		config: VideoConfig
	) => React.ReactNode;
	startFrame?: number;
	endFrame?: number;
}> = ({
	startFrame,
	endFrame,
	src,
	renderSubtitleItem = (item) => <span>{item.text}</span>,
}) => {
	const frame = useCurrentFrame();
	const config = useVideoConfig();
	const subtitles = useWindowedFrameSubs(src, {
		windowStart: startFrame,
		windowEnd: endFrame,
	});

	return (
		<>
			{subtitles.map((item) => (
				<React.Fragment key={item.id}>
					{renderSubtitleItem(item, frame, config)}
				</React.Fragment>
			))}
		</>
	);
};

const ZOOM_MEASURER_SIZE = 10;
export const LINE_HEIGHT = 98;

export const PaginatedSubtitles: React.FC<{
	src: string;
	renderSubtitleItem?: (
		item: SubtitleItem,
		frame: number,
		config: VideoConfig
	) => React.ReactNode;
	startFrame?: number;
	endFrame?: number;
	linesPerPage: number;
}> = ({
	startFrame,
	endFrame,
	src,
	renderSubtitleItem = (item) => <span>{item.text}</span>,
	linesPerPage,
}) => {
	const frame = useCurrentFrame();
	const config = useVideoConfig();
	const windowRef = useRef<HTMLDivElement>(null);
	const zoomMeasurer = useRef<HTMLDivElement>(null);
	const [handle] = useState(() => delayRender());
	const [fontHandle] = useState(() => delayRender());
	const [fontLoaded, setFontLoaded] = useState(false);
	const subtitles = useWindowedFrameSubs(src, {
		windowStart: startFrame,
		windowEnd: endFrame,
	});

	const [lineOffset, setLineOffset] = useState(0);

	const currentSubtitleItem = subtitles
		.slice()
		.reverse()
		.find((item) => item.start < frame);

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
		ensureFont().then(() => {
			continueRender(fontHandle);
			setFontLoaded(true);
		});
	}, [fontHandle, fontLoaded]);

	const lineSubs = (() => {
		const finalLines: SubtitleItem[][] = [];
		const lineIndex = 0;

		for (let i = 0; i < subtitles.length; i++) {
			const subtitleItem = subtitles[i];

			if (subtitleItem.start >= frame) continue;

			finalLines[lineIndex] = [...(finalLines[lineIndex] ?? []), subtitleItem];
		}

		return finalLines;
	})();

	const currentLineIndex = Math.max(
		0,
		lineSubs.findIndex((l) => l.includes(currentSubtitleItem as SubtitleItem))
	);

	const startLine = Math.max(0, currentLineIndex - (linesPerPage - 1));

	return (
		<div
			style={{
				position: 'relative',
				overflow: 'hidden',
			}}
		>
			<div
				ref={windowRef}
				style={{
					transform: `translateY(-${lineOffset * LINE_HEIGHT}px)`,
				}}
			>
				{lineSubs
					.slice(startLine, startLine + linesPerPage)
					.reduce((subs, item) => [...subs, ...item], [])
					.map((item) => (
						<span key={item.id} id={String(item.id)}>
							{renderSubtitleItem(item, frame, config)}
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
