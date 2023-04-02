import React, {useState, useEffect} from 'react';

import {
	Box,
	Grid,
	Button,
	MenuItem,
	Paper,
	Typography,
	FormControl,
	InputLabel,
	Select,
	TextField,
	FormHelperText,
} from '@mui/material';

import NotificationsC, {type Message} from './shared/NotificationsC';
import CardC from './shared/CardC';

import ExperimentConfig from '../../common/models/experimentConfig';
import TransitionSetting, {OperatorType} from '../../server/models/transitionSetting';

import {useAdminApi} from '../adminApiProvider';

const createTransitionSetting = (from: number, to: number): TransitionSetting => {
	const setting = new TransitionSetting();
	setting.fromPhase = from;
	setting.toPhase = to;
	return setting;
};

const PhaseC: React.FC<{
	from: number;
	to: number;
}> = ({from, to}) => {
	const api = useAdminApi();
	const [setting, setSetting] = useState(
		createTransitionSetting(from, to),
	);
	const [message, setMessage] = useState<Message>();

	useEffect(() => {
		(async () => {
			const setting = await api.getTransitionSetting(from, to);
			if (setting.kind === 'Success') {
				setSetting(setting.value);
			}
		})();
	}, [from, to]);

	const ui = (
		<form
			onSubmit={async e => {
				e.preventDefault();

				const result = await api.createTransitionSetting(setting);

				if (result.kind === 'Success') {
					setMessage({
						severity: 'success',
						text: `Phase transition settings from phase ${setting.fromPhase} to phase ${setting.toPhase} saved!`,
					});
				} else {
					setMessage({
						severity: 'error',
						text: result.message,
					});
				}
			}}
		>
			<Box
				component={Paper}
				sx={{
					p: 2,
					mb: 2,
				}}
			>
				<Typography variant='h2'>
					Move participants from phase&nbsp;{from} to phase&nbsp;{to}...
				</Typography>
				<Typography variant='body2' sx={{mb: 1}}>
					...once they have met
				</Typography>
				<FormControl sx={{width: 235}}>
					<InputLabel id={`transition-type-label-${from}-${to}`}>
						Operator
					</InputLabel>
					<Select
						labelId={`transition-type-label-${from}-${to}`}
						label='Operator'
						value={setting.operator}
						onChange={e => {
							setSetting({
								...setting,
								operator: e.target.value as OperatorType,
							});
						}}
					>
						<MenuItem value={OperatorType.ALL}>{OperatorType.ALL}</MenuItem>
						<MenuItem value={OperatorType.ANY}>{OperatorType.ANY}</MenuItem>
					</Select>
				</FormControl>
				<Typography variant='body2' sx={{mb: 2}}>
					of the following <strong>daily</strong> criteria:
				</Typography>
				<Box
					sx={{
						'& .MuiTextField-root': {m: 1},
					}}
				>
					<Box sx={{mb: 1}}>
						<TextField
							label='Pages viewed'
							type='number'
							helperText='Minimum number of pages viewed'
							value={setting.minPagesViewed}
							onChange={e => {
								setSetting({
									...setting,
									minPagesViewed: parseInt(e.target.value, 10),
								});
							}}
						/>
						<TextField
							label='Video pages viewed'
							type='number'
							helperText='Minimum number of video pages viewed'
							value={setting.minVideoPagesViewed}
							onChange={e => {
								setSetting({
									...setting,
									minVideoPagesViewed: parseInt(e.target.value, 10),
								});
							}}
						/>
					</Box>
					<Box sx={{mb: 1}}>
						<TextField
							label='Recommendations clicked'
							type='number'
							helperText='Minimum number of sidebar recommendations clicked'
							value={setting.minSidebarRecommendationsClicked}
							onChange={e => {
								setSetting({
									...setting,
									minSidebarRecommendationsClicked: parseInt(e.target.value, 10),
								});
							}}
						/>
					</Box>
					<Box sx={{mb: 1}}>
						<TextField
							label='Watch time'
							type='number'
							helperText='Minimum total watch time in minutes'
							value={setting.minVideoTimeViewedSeconds / 60}
							onChange={e => {
								setSetting({
									...setting,
									minVideoTimeViewedSeconds: parseFloat(e.target.value) * 60,
								});
							}}
						/>
						<TextField
							label='Time spent on YouTube'
							type='number'
							helperText='Minimum time spent on YouTube in minutes, approximate'
							value={setting.minTimeSpentOnYoutubeSeconds / 60}
							onChange={e => {
								setSetting({
									...setting,
									minTimeSpentOnYoutubeSeconds: parseFloat(e.target.value) * 60,
								});
							}}
						/>
					</Box>
					<Typography variant='body2' sx={{mb: 1}}>
						for <strong>at least</strong>:
					</Typography>
					<TextField
						sx={{display: 'block'}}
						label='Number of days'
						type='number'
						helperText='Minimum number of days to trigger the phase transition, not necessarily consecutive'
						value={setting.minDays}
						onChange={e => {
							setSetting({
								...setting,
								minDays: parseInt(e.target.value, 10),
							});
						}}
					/>
					{from > 0 && (
						<Typography variant='body2' sx={{mt: 2, mb: 1}}>
							<strong>Note</strong> that this number of days is counted
							since the entry of the the participant into phase&nbsp;{from}, they are not cumulative with the days spent in phase&nbsp;{from - 1}.
						</Typography>
					)}

					<Button
						variant='contained'
						type='submit'
						color='primary'
						sx={{m: 2}}
					>
						Save
					</Button>

					<NotificationsC message={message} />
				</Box>
			</Box>
		</form>
	);

	return ui;
};

export const ExperimentConfigC = () => {
	const [message, setMessage] = useState<Message>();
	const [config, setConfig] = useState<ExperimentConfig>(new ExperimentConfig());
	const [configLoaded, setConfigLoaded] = useState(false);
	const [configHistory, setConfigHistory] = useState<ExperimentConfig[]>([]);
	const api = useAdminApi();
	const [probaField, setProbaField] = useState<string>('');

	const loadHistory = async () => {
		const configHistory = await api.getExperimentConfigHistory();

		if (configHistory.kind === 'Success') {
			setConfigHistory(configHistory.value);
		}
	};

	useEffect(() => {
		if (!configLoaded) {
			setConfigLoaded(true);
			(async () => {
				const config = await api.getExperimentConfig();

				if (config.kind === 'Success') {
					setConfig(config.value);
					setProbaField(config.value.nonPersonalizedProbability.toString());
				} else {
					setMessage({
						text: config.message,
						severity: 'error',
					});
				}
			})();
		}

		if (configHistory.length === 0) {
			loadHistory().catch(console.error);
		}
	}, [configLoaded]);

	const handleProbabilityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setProbaField(event.target.value);

		const proba = parseFloat(event.target.value);

		if (proba <= 1 && proba >= 0) {
			setConfig({
				...config,
				nonPersonalizedProbability: parseFloat(event.target.value),
			});
		} else {
			setMessage({
				text: 'Probability must be between 0 and 1',
				severity: 'error',
			});
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		setMessage({
			text: 'Saving config...',
		});

		(async () => {
			const response = await api.postExperimentConfig(config);

			if (response.kind === 'Success') {
				setMessage({
					text: 'Config saved',
					severity: 'success',
				});
				setConfig(response.value);
				setProbaField(response.value.nonPersonalizedProbability.toString());
			} else {
				setMessage({
					text: response.message,
					severity: 'error',
				});
			}
		})();

		loadHistory().catch(console.error);
	};

	const ui = (
		<Box>
			<NotificationsC message={message}/>
			<Grid container spacing={8}>
				<Grid item xs={12} component='section'>
					<Typography variant='h1' sx={{mb: 4}}>
						Phase transitioning
					</Typography>
					<Typography
						variant='body1'
						sx={{
							mb: 2,
							'& a:visited': {color: 'inherit'},
							'& a': {color: 'inherit'},
						}}
					>
						Here you can configure how participants are moved from one phase to another.
						<br/>There are three phases, numbered 0, 1 and 2.
						<br/>A participant starts in phase 0, and moves on to the subsequent phases according to the criteria you define below.
						<br/>The setting of the <a href='#setting'>non-personalized</a> probability only applies to participants in phase 1.
						<br/>Otherwise this probability is <strong>zero</strong>, so that the user experience is as close to the regular YouTube as possible.
					</Typography>
					<PhaseC from={0} to={1}/>
					<PhaseC from={1} to={2}/>
				</Grid>
				<Grid item xs={12} sm={6} component='section' id='setting'>
					<Typography variant='h1' sx={{mb: 4}}>
						Experiment Config
					</Typography>
					<form onSubmit={handleSubmit}>
						<Box sx={{
							display: 'flex',
							flexDirection: 'column',
							gap: 2,
						}}>
							<FormControl>
								<TextField
									label='Non-personalized probability'
									type='number'
									inputProps={{min: 0, max: 1, step: 0.01}}
									id='nonPersonalizedProbability'
									value={probaField}
									onChange={handleProbabilityChange}
								/>
								<FormHelperText>
									Probability of showing a non-personalized recommendation
								</FormHelperText>
							</FormControl>
							<FormControl>
								<TextField
									label='Comment about this version of the configuration'
									id='comment'
									value={config.comment}
									onChange={e => {
										setConfig({...config, comment: e.target.value});
									}}
								/>
							</FormControl>
							<FormHelperText>
								Useful to remember why you changed the config
							</FormHelperText>
							<Box>
								<Button type='submit' variant='contained' sx={{mt: 2}}>
									Save
								</Button>
							</Box>
						</Box>
					</form>
				</Grid>
				<Grid item xs={12} sm={6} component='section'>
					<Typography variant='h1' sx={{mb: 4}}>Configurations History</Typography>

					{configHistory.length === 0 && <Typography>No configurations found in history</Typography>}

					<Grid container spacing={2}>
						{configHistory.map(c => (
							<Grid key={c.id} item xs={12}>
								<CardC>
									<Typography>
										<strong>#{c.id}</strong> created on {new Date(c.createdAt).toLocaleDateString()}
										&nbsp;by: {c.admin?.email ?? 'unknown'}
									</Typography>
									<dl>
										<dt><Typography><strong>Non-personalized probability</strong></Typography></dt>
										<dd><Typography>{c.nonPersonalizedProbability}</Typography></dd>
										<dt><Typography><strong>Comment</strong></Typography></dt>
										<dd><Typography>{c.comment}</Typography></dd>
									</dl>
								</CardC>
							</Grid>
						))}
					</Grid>
				</Grid>
			</Grid>
		</Box>
	);

	return ui;
};

export default ExperimentConfigC;
