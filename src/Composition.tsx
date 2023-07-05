import { useAudioData, visualizeAudio } from '@remotion/media-utils';
import React, { useEffect, useRef, useState } from 'react';
import {
	AbsoluteFill,
	Audio,
	continueRender,
	delayRender,
	Img,
	Sequence,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

import { PaginatedSubtitles } from './Subtitles';
import { z } from 'zod';
import { zColor } from '@remotion/zod-types';

export const AudioGramSchema = z.object({
	subtitlesFileName: z.string(),
	audioFileName: z.string(),
	coverImgFileName: z.string(),
	titleText: z.string(),
	titleColor: zColor(),
	waveColor: zColor(),
	audioOffsetInFrames: z.number().int().min(0),
	subtitlesTextColor: zColor(),
	subtitlesLinePerPage: z.number().int().min(0),
	subtitlesLineHeight: z.number().int().min(0),
	subtitlesZoomMeasurerSize: z.number().int().min(0),
	onlyDisplayCurrentSentence: z.boolean(),
	mirrorWave: z.boolean(),
	waveLinesToDisplay: z.number().int().min(0),
	waveFreqRangeStartIndex: z.number().int().min(0),
	waveNumberOfSamples: z.enum(['32', '64', '128', '256', '512']),
});

type MyCompSchemaType = z.infer<typeof AudioGramSchema>;

const AudioViz: React.FC<{
	waveColor: string;
	numberOfSamples: number;
	freqRangeStartIndex: number;
	waveLinesToDisplay: number;
	mirrorWave: boolean;
	audioSrc: string;
}> = ({
	waveColor,
	numberOfSamples,
	freqRangeStartIndex,
	waveLinesToDisplay,
	mirrorWave,
	audioSrc
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	
	const audioData = useAudioData(audioSrc);

	if (!audioData) {
		return null;
	}

	const frequencyData = visualizeAudio({
		fps,
		frame,
		audioData,
		numberOfSamples, // Use more samples to get a nicer visualisation
	});

	// Pick the low values because they look nicer than high values
	// feel free to play around :)
	const frequencyDataSubset = frequencyData.slice(
		freqRangeStartIndex,
		freqRangeStartIndex + (mirrorWave? Math.round(waveLinesToDisplay / 2) : waveLinesToDisplay)
	);

	const frequencesToDisplay = mirrorWave? [
		...frequencyDataSubset.slice(1).reverse(),
		...frequencyDataSubset,
	] : frequencyDataSubset;

	return (
		<div className="audio-viz">
			{frequencesToDisplay.map((v, i) => {
				return (
					<div
						key={i}
						className="bar"
						style={{
							minWidth: "1px",
							backgroundColor: waveColor,
							height: `${500 * Math.sqrt(v)}%`,
						}}
					/>
				);
			})}
		</div>
	);
};

export const AudiogramComposition: React.FC<
	{
		subtitlesFileName: string;
		audioOffsetInFrames: number;
		onlyDisplayCurrentSentence: boolean;
	} & MyCompSchemaType
> = ({
	subtitlesFileName,
	audioFileName,
	coverImgFileName,
	audioOffsetInFrames,
	titleText,
	titleColor,
	subtitlesTextColor,
	subtitlesLinePerPage,
	waveColor,
	waveNumberOfSamples,
	waveFreqRangeStartIndex,
	waveLinesToDisplay,
	subtitlesZoomMeasurerSize,
	subtitlesLineHeight,
	onlyDisplayCurrentSentence,
	mirrorWave,
}) => {
	const { durationInFrames } = useVideoConfig();

	const [handle] = useState(() => delayRender());
	const [subtitles, setSubtitles] = useState<string | null>(null);
	const ref = useRef<HTMLDivElement>(null);

	// get the static files
	const subtitlesSrc = staticFile(subtitlesFileName);
	const audioSrc = staticFile(audioFileName)
	const coverImgSrc = staticFile(coverImgFileName);

	useEffect(() => {
		fetch(subtitlesSrc)
			.then((res) => res.text())
			.then((text) => {
				setSubtitles(text);
				continueRender(handle);
			})
			.catch((err) => {
				console.log('Error fetching subtitles', err);
			});
	}, [handle, subtitlesSrc]);

	if (!subtitles) {
		return null;
	}



	return (
		<div ref={ref}>
			<AbsoluteFill>
				<Sequence from={-audioOffsetInFrames}>
					<Audio src={audioSrc} />

					<div
						className="container"
						style={{
							fontFamily: 'IBM Plex Sans',
						}}
					>
						<div className="row">
							<Img className="cover" src={coverImgSrc} />

							<div className="title" style={{ color: titleColor }}>
								{titleText}
							</div>
						</div>

						<div>
							<AudioViz
								audioSrc={audioSrc}
								mirrorWave={mirrorWave}
								waveColor={waveColor}
								numberOfSamples={Number(waveNumberOfSamples)}
								freqRangeStartIndex={waveFreqRangeStartIndex}
								waveLinesToDisplay={waveLinesToDisplay}
							/>
						</div>

						<div
							style={{ lineHeight: `${subtitlesLineHeight}px` }}
							className="captions"
						>
							<PaginatedSubtitles
								subtitles={subtitles}
								startFrame={audioOffsetInFrames}
								endFrame={audioOffsetInFrames + durationInFrames}
								linesPerPage={subtitlesLinePerPage}
								subtitlesTextColor={subtitlesTextColor}
								subtitlesZoomMeasurerSize={subtitlesZoomMeasurerSize}
								subtitlesLineHeight={subtitlesLineHeight}
								onlyDisplayCurrentSentence={onlyDisplayCurrentSentence}
							/>
						</div>
					</div>
				</Sequence>
			</AbsoluteFill>
		</div>
	);
};
