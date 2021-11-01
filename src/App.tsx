import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, Nav } from 'react-bootstrap';
import { BarChartFill, ExclamationTriangleFill, HouseDoorFill, X } from 'react-bootstrap-icons';
import './App.css';
import { HardwareTargets } from './hardware-targets/index';
import { errorMappings } from './lib/error-messages';
import {
	EngineType,
	HardwareTargetsShape,
	MappedHardwareTargets,
	OctoActions,
	OctState,
} from './lib/types';
import { OctomizeType } from './octomize-type/index';
import octoLogo from './resources/images/octo-logo.svg';
import { octomizeAction } from './services/octomize';

type TotalRuns = {
	[key: string]: number;
};

function App() {
	const [status, setStatus] = useState(null);
	const [hardwareTargets, setHardwareTargets] = useState<MappedHardwareTargets[]>([]);
	const [selectedTargets, setSelectedTargets] = useState<HardwareTargetsShape[]>([]);
	const [totalRuns, setTotalRuns] = useState<TotalRuns>({});
	const [octomizeActions, setOctomizeActions] = useState<OctoActions>({});
	const [octomizeState, setOctomizeState] = useState<OctState>({
		benchmark: {
			selected: false,
			engineType: EngineType.ONNX,
			engine: EngineType.ONNX,
			num_trials: 0,
			runs_per_trial: 0,
		},
		accelerate: {
			selected: false,
			engine: EngineType.ONNX,
			engineType: EngineType.ONNX,
		},
	});

	/**
	 * Uses octomizeActions from state to map through all the hardware targets and selected actions to calculate total runs and make the octomization call.
	 * @param {boolean} actionsCall - actionsCall true will make the octomization call else will only calculate total runs
	 */
	const octomize = (actionsCall?: boolean) => {
		setStatus(null);
		const actionRuns = Object.keys(octomizeActions).reduce((acc: TotalRuns, action: string) => {
			actionsCall
				? Promise.all(
						octomizeActions[action].map((target) => octomizeAction(action, target))
				  ).catch((e) => {
						setStatus(e?.response?.status);
				  })
				: octomizeActions[action].forEach((target) => {
						acc = {
							...acc,
							[target.hardware.instance]: Object.keys(octomizeActions).length,
						};
				  });
			return actionsCall ? totalRuns : acc;
		}, {});
		setTotalRuns(actionRuns);
	};

	/**
	 * Creates octoActions, an object to save all the hardware targets for a selected action
	 * @returns {OctoActions}
	 */
	const createOctoActions = () => {
		const benchmark = [];
		const accelerate = [];
		const octoActions = selectedTargets.reduce((acc, curr) => {
			benchmark.push({
				hardware: curr,
				engine: octomizeState.benchmark.engine,
				num_trials: octomizeState.benchmark.num_trials,
				runs_per_trial: octomizeState.benchmark.runs_per_trial,
			});
			accelerate.push({
				hardware: curr,
				engine: octomizeState.accelerate.engine,
			});
			acc = {
				...(octomizeState.benchmark.selected && {
					benchmark,
				}),
				...(octomizeState.accelerate.selected && {
					accelerate,
				}),
			};
			return acc;
		}, {});
		setOctomizeActions(octoActions);
	};

	useEffect(() => {
		createOctoActions();
	}, [selectedTargets, octomizeState]);

	useEffect(() => {
		octomize();
	}, [octomizeActions, selectedTargets]);

	const getTotalRuns = () =>
		Object.keys(totalRuns).reduce((run, curr) => run + totalRuns[curr], 0);

	const disabledOctomization =
		!selectedTargets.length ||
		!selectedTargets[0].instance ||
		!Object.keys(octomizeActions).length;

	return (
		<div className="App">
			<Nav defaultActiveKey="/home" className="flex-column nav-bar">
				<Nav.Link eventKey="link-1">
					<img src={octoLogo} alt="octo-ml" className="octo-logo"></img>
				</Nav.Link>
				<Nav.Link eventKey="link-2">
					<HouseDoorFill className="home-icon" />
				</Nav.Link>
				<Nav.Link eventKey="link-3">
					<BarChartFill className="chart-icon" />
				</Nav.Link>
			</Nav>
			<div>
				<div className="page-title">
					<div className="alert-container">
						{status && (
							<Alert variant={'danger'}>
								<ExclamationTriangleFill className="alert-icon" />
								{errorMappings[status]}
								<X className="clear-alert" onClick={() => setStatus(null)} />
							</Alert>
						)}
					</div>
					<span className="main-title">Shufflenet-v2.onnx</span>
					<span className="meta-info">Created three days ago by Mike Johnson</span>
				</div>
				<Card className="card-container">
					<Card.Body>
						<Card.Title className="oct-card-title">Octomize</Card.Title>
						<OctomizeType
							setOctomizeState={setOctomizeState}
							octomizeState={octomizeState}
						/>
						<HardwareTargets
							hardwareTargets={hardwareTargets}
							setHardwareTargets={setHardwareTargets}
							selectedTargets={selectedTargets}
							setSelectedTargets={setSelectedTargets}
						/>
					</Card.Body>
				</Card>
				<Card className="runs-container">
					<Card.Body className="runs-card-body">
						<Card.Title className="runs-card-title">
							<span className="runs-title">Total Runs</span>
							<span className="runs-total-count">{getTotalRuns()}</span>
						</Card.Title>
						<div className="selected-instances">
							{selectedTargets.map(
								(item) =>
									item.instance && (
										<div className="instance-info">
											<div className="cpu-info">
												<span className="instance-run-name">
													{item.instance}
												</span>
												<span className="instance-cpu">
													{item.cpu} cores
												</span>
											</div>
											<span className="instance-runs">
												{Object.keys(totalRuns).map(
													(instance) =>
														instance === item.instance &&
														totalRuns[instance]
												)}
											</span>
										</div>
									)
							)}
						</div>
						<Button
							variant="primary"
							className={`octomize-btn ${disabledOctomization && 'disabled-btn'}`}
							onClick={() => octomize(true)}
							disabled={disabledOctomization}
						>
							Octomize
						</Button>
					</Card.Body>
				</Card>
			</div>
		</div>
	);
}

export default App;
