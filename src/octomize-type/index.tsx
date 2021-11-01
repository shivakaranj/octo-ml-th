import React from 'react';
import { Accordion, FormControl, InputGroup } from 'react-bootstrap';
import { EngineType, OctType } from '../lib/types';
import './OctomizeType.css';

export const OctomizeType = ({ setOctomizeState, octomizeState }: any) => {
	/**
	 * Handles engine selection for benchmark and accelerate actions
	 * @params {HTMLInputElement}
	 * @params {benchmark | accelerate}
	 */
	const handleEngine = (event: React.ChangeEvent<HTMLInputElement>, octType: OctType) => {
		setOctomizeState({
			...octomizeState,
			[octType]: {
				...octomizeState[octType],
				engineType: event.target.value,
				engine:
					(octType === OctType.BENCHMARK && event.target.value) ||
					event.target.value === EngineType.ONNX
						? event.target.value
						: { [event.target.value]: { kernel_trials: 0 } },
			},
		});
	};

	/**
	 * Handles num_trials, runs_per_trial input fields for benchmark action
	 * Handles kernel_trials input field for acceleration action TVM engine
	 * @params {HTMLInputElement}
	 * @params {benchmark | accelerate}
	 */
	const handleTrials = (event: React.ChangeEvent<HTMLInputElement>, octType: OctType) => {
		const numOfTrials = Number(event.target.value);
		const isNaN = Number.isNaN(numOfTrials);
		if (isNaN) return;
		const newState = {
			...octomizeState,
			[octType]: {
				...octomizeState[octType],
				...(octType === OctType.BENCHMARK
					? { [event.target.name]: numOfTrials }
					: {
							engine: {
								TVM: {
									kernel_trials: numOfTrials,
								},
							},
					  }),
			},
		};
		setOctomizeState(newState);
	};

	/**
	 * Handles action selection between benchmark and accelerate
	 * @params {HTMLInputElement}
	 * @params {benchmark | accelerate}
	 */
	const handleOctTypeSelection = (
		event: React.ChangeEvent<HTMLInputElement>,
		octType: OctType
	) => {
		setOctomizeState({
			...octomizeState,
			[octType]: {
				...octomizeState[octType],
				selected: event.target.checked,
			},
		});
	};

	const kernel_trials_value =
		(octomizeState.accelerate.engineType === EngineType.TVM &&
			octomizeState.accelerate.engine?.TVM?.kernel_trials) ||
		0;

	const renderEngineOptions = (octType: OctType) => {
		return (
			<InputGroup>
				<InputGroup.Radio
					value={EngineType.ONNX}
					name={`${octType}-engine`}
					checked={octomizeState[octType].engineType === 'ONNX'}
					aria-label="Radio 1"
					onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
						handleEngine(event, octType)
					}
				/>
				<label className="engine-label">{EngineType.ONNX}</label>
				<InputGroup.Radio
					checked={octomizeState[octType].engineType === 'TVM'}
					value={EngineType.TVM}
					name={`${octType}-engine`}
					aria-label="Radio 2"
					onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
						handleEngine(event, octType)
					}
				/>
				<label className="engine-label"> {EngineType.TVM}</label>
			</InputGroup>
		);
	};

	const { benchmark, accelerate } = octomizeState;

	const renderActions = (actionType) => {
		return (
			<Accordion>
				<Accordion.Item eventKey="0">
					<Accordion.Header>
						<InputGroup.Checkbox
							aria-label="benchmark"
							name="selected"
							checked={octomizeState[actionType].selected}
							onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
								handleOctTypeSelection(event, actionType)
							}
						/>
						<div className="header-text">
							<span className="action-type">{actionType}</span>
							<span className="action-help-text">
								Please select additional required options from within.
							</span>
						</div>
					</Accordion.Header>
					<Accordion.Body>
						<span>{renderEngineOptions(actionType)}</span>
						{actionType === OctType.BENCHMARK && (
							<>
								<span className="num-trials">
									<label className="num-trials-label">Num of trials:</label>
									<FormControl
										className="num-trials-field"
										value={benchmark.num_trials}
										name="num_trials"
										onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
											handleTrials(event, OctType.BENCHMARK)
										}
									/>
								</span>
								<span className="run-trials">
									<label className="run-trials-label">Runs per trial:</label>
									<FormControl
										className="run-trials-field"
										value={benchmark.runs_per_trial}
										name="runs_per_trial"
										onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
											handleTrials(event, OctType.BENCHMARK)
										}
									/>
								</span>
							</>
						)}
						{(actionType === OctType.ACCELERATE && accelerate.engineType) ===
							EngineType.TVM && (
							<span className="kernel-trials">
								<span className="kernel-trials-label">Kernel trails:</span>
								<FormControl
									className="kernel-trials-field"
									value={kernel_trials_value}
									name="kernel_trials"
									onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
										handleTrials(event, OctType.ACCELERATE)
									}
								/>
							</span>
						)}
					</Accordion.Body>
				</Accordion.Item>
			</Accordion>
		);
	};

	return (
		<div className="octomize-type-container">
			{renderActions(OctType.BENCHMARK)}
			{renderActions(OctType.ACCELERATE)}
		</div>
	);
};
