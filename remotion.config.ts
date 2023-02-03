// All configuration options: https://remotion.dev/docs/config
// Each option also is available as a CLI flag: https://remotion.dev/docs/cli
// ! The configuration file does only apply if you render via the CLI !

import { Config } from 'remotion';

Config.setImageFormat('jpeg');
Config.setOverwriteOutput(true);

// This template processes the whole audio file on each thread which is heavy.
// You are safe to increase concurrency if the audio file is small or your machine strong!
Config.setConcurrency(1);
