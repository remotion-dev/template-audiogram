import { Composition } from 'remotion';
import { AudioGramSchema, AudiogramComposition } from './Composition';
import './style.css';

const fps = 30;
const durationInFrames = 29.5 * fps;

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition
				id="Audiogram"
				component={AudiogramComposition}
				durationInFrames={durationInFrames}
				fps={fps}
				width={1080}
				height={1080}
				schema={AudioGramSchema}
				defaultProps={{
					// audio settings
					audioOffsetInFrames: 207,

					// title settings
					audioFileName: 'audio.mp3',
					coverImgFileName: 'cover.jpg',
					titleText:
						'#234 – Money, Kids, and Choosing Your Market with Justin Jackson of Transistor.fm',
					titleColor: 'rgba(186, 186, 186, 0.93)',

					// subtitles settings
					subtitlesFileName: 'subtitles.srt',
					onlyDisplayCurrentSentence: true,
					subtitlesTextColor: 'rgba(255, 255, 255, 0.93)',
					subtitlesLinePerPage: 4,
					subtitlesZoomMeasurerSize: 10,
					subtitlesLineHeight: 98,

					// wave settings
					waveColor: '#a3a5ae',
					waveFreqRangeStartIndex: 7,
					waveLinesToDisplay: 29,
					waveNumberOfSamples: '256', // this is string for Remotion controls and will be converted to a number
					mirrorWave: true,
				}}
			/>
		</>
	);
};
