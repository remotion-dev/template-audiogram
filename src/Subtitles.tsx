import parseSRT, {SubtitleItem} from 'parse-srt';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useCurrentFrame, useVideoConfig, VideoConfig} from 'remotion';

const useWindowedFrameSubs = (
	src: string,
	options: {windowStart?: number; windowEnd?: number} = {}
) => {
	const {windowStart = -Infinity, windowEnd = Infinity} = options;
	const config = useVideoConfig();
	const {fps} = config;

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

type PaginationLine = {
	index: number;
	offsetTop: number;
};
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
	const pageRef = useRef<HTMLDivElement | null>(null);
	const frame = useCurrentFrame();
	const config = useVideoConfig();
	const subtitles = useWindowedFrameSubs(src, {
		windowStart: startFrame,
		windowEnd: endFrame,
	});
	const [lines, setLines] = useState<PaginationLine[]>([]);

	useEffect(() => {
		const pageElement = pageRef.current;
		if (!pageElement) return;
		const lineOffsets = Array.from(pageElement.childNodes).reduce<
			PaginationLine[]
		>((acc, item) => {
			const {offsetTop, id} = item as HTMLElement;
			const lastOffsetTop = acc[acc.length - 1]?.offsetTop;
			if (lastOffsetTop === offsetTop) return acc;
			return [...acc, {index: Number(id), offsetTop}];
		}, []);
		setLines(lineOffsets);
	}, [frame]);

	const currentSubtitleItem = subtitles
		.slice()
		.reverse()
		.find((item) => item.start < frame);

	const lineSubs = (() => {
		const finalLines: SubtitleItem[][] = [];
		let lineIndex = 0;

		for (let i = 0; i < subtitles.length; i++) {
			const subtitleItem = subtitles[i];

			if (subtitleItem.start >= frame) continue;

			for (let j = 0; j < lines.length; j++) {
				const lineItem = lines[j];

				if (subtitleItem.id >= lineItem.index) {
					lineIndex = j;
				}
			}
			finalLines[lineIndex] = [...(finalLines[lineIndex] ?? []), subtitleItem];
		}

		return finalLines;
	})();

	const currentLineIndex = Math.max(
		0,
		lineSubs.findIndex((l) => l.includes(currentSubtitleItem!))
	);

	const startLine = Math.max(0, currentLineIndex - (linesPerPage - 1));
	// const startLine = linesPerPage * Math.floor(currentLineIndex / linesPerPage);

	return (
		<div style={{position: 'relative'}}>
			{/* <div>
				 {JSON.stringify({startLine, linesPerPage})}
				 <br />
				---
				<br />
				{JSON.stringify(currentSubtitleItem)}
				<br />
				---
				<br />
				{JSON.stringify(lines)}
				<br />
				---
				<br />
				{lineSubs.map((l) => (
					<>
						<br />
						{JSON.stringify(l.map((i) => i.text))}
					</>
				))}
			</div> */}
			<div>
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
				ref={pageRef}
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					visibility: 'hidden',
				}}
			>
				{subtitles.map((item) => (
					<span key={item.id} id={String(item.id)}>
						{renderSubtitleItem(item, frame, config)}
					</span>
				))}
			</div>
		</div>
	);
};
