import uniqBy from 'lodash/uniqBy';
import React, { useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';
import { X } from 'react-bootstrap-icons';
import { HardwareTargetsShape, MappedHardwareTargets } from '../lib/types';
import { getHardwareTargets } from '../services/octomize';
import './HardwareTargets.css';

export const HardwareTargets = ({
	hardwareTargets,
	setHardwareTargets,
	selectedTargets,
	setSelectedTargets,
}) => {
	/**
	 * Handles fetching available hardware targets, mapping the targets and setting it to state
	 * @returns {MappedHardwareTargets}
	 */
	const handleFetchHardwareTargets = async () => {
		const targets: HardwareTargetsShape[] = await getHardwareTargets();
		const mappedtargets = targets.reduce(
			(acc: MappedHardwareTargets, curr: HardwareTargetsShape) => {
				acc = {
					...acc,
					[curr.provider]: {
						...acc[curr.provider],
						[curr.instance]: {
							cpu: curr.cpu,
							memory: curr.memory,
						},
					},
				};
				return acc;
			},
			{}
		);
		setHardwareTargets([mappedtargets]);
	};

	useEffect(() => {
		handleFetchHardwareTargets();
	}, []);

	/**
	 * Handles selection of provider and instance based on the index of selection to create an array of selected values
	 * @params {HTMLInputElement}
	 * @params {number} index of selected hardware target
	 */
	const handleSelectedTargets = (event, targetIndex: number) => {
		const { name, value } = event.target;
		const updatedTargets = selectedTargets;
		const cpu =
			name === 'instance' &&
			hardwareTargets[targetIndex][selectedTargets[targetIndex]?.provider]?.[value]?.cpu;
		const memory =
			name === 'instance' &&
			hardwareTargets[targetIndex][selectedTargets[targetIndex]?.provider]?.[value]?.memory;
		updatedTargets[targetIndex] = {
			...selectedTargets[targetIndex],
			[name]: value,
			...(name === 'provider' && { instance: null }),
			cpu,
			memory,
		};
		setSelectedTargets(uniqBy([...updatedTargets], 'instance'));
	};

	const addAnotherTarget = () => {
		const addedTarget = hardwareTargets.concat(hardwareTargets[0]);
		setHardwareTargets(addedTarget);
	};

	const removeTarget = (targetIndex) => {
		const updatedTargets = !!targetIndex
			? hardwareTargets.filter((_, index) => index !== targetIndex)
			: hardwareTargets;
		setHardwareTargets(updatedTargets);
		const updatedSelectedTargets = selectedTargets.filter((_, index) => index !== targetIndex);
		setSelectedTargets(updatedSelectedTargets);
	};

	const getCpuMemory = ({
		targets,
		index,
		field,
	}: {
		targets: HardwareTargetsShape;
		index: number;
		field: string;
	}) => {
		return (
			targets[selectedTargets[index]?.provider]?.[selectedTargets[index].instance]?.[field] ||
			0
		);
	};

	return (
		<div className="hardware-targets-container">
			<div className="targets-header">
				<span className="targets-title">Hardware targets</span>
				<Button
					variant="primary"
					className={`add-target-btn ${hardwareTargets.length === 3 && 'disabled-btn'}`}
					onClick={addAnotherTarget}
					disabled={hardwareTargets.length === 3}
				>
					Add
				</Button>
			</div>
			<div className="target-field-headers">
				<span className="target-header provider">PROVIDER</span>
				<span className="target-header instance">INSTANCE</span>
				<span className="target-header vcpu">VCPU</span>
				<span className="target-header memory">MEMORY (GIB)</span>
			</div>
			<div className="target-fields-container">
				{hardwareTargets.map((targets, index) => {
					return (
						<div className="target-fields" key={targets.provider}>
							<Form.Select
								className="provider-field"
								name="provider"
								onChange={(event) => handleSelectedTargets(event, index)}
							>
								<option value="">Select Provider</option>
								{Object.keys(targets).map((provider) => (
									<option value={provider} key={provider}>
										{provider}
									</option>
								))}
							</Form.Select>
							<Form.Select
								className="instance-field"
								name="instance"
								onChange={(event) => handleSelectedTargets(event, index)}
								disabled={
									!selectedTargets.length || !selectedTargets[index]?.provider
								}
							>
								<option value="">Select Instance</option>
								{!!selectedTargets.length &&
									selectedTargets[index]?.provider &&
									Object.keys(targets[selectedTargets[index].provider]).map(
										(instance) => (
											<option value={instance} key={instance}>
												{instance}
											</option>
										)
									)}
							</Form.Select>
							<span
								className={`hardware-cpu ${
									!getCpuMemory({
										targets,
										index,
										field: 'cpu',
									}) && 'disabled-field'
								}`}
							>
								{getCpuMemory({ targets, index, field: 'cpu' })}
							</span>
							<span
								className={`hardware-memory ${
									!getCpuMemory({
										targets,
										index,
										field: 'cpu',
									}) && 'disabled-field'
								}`}
							>
								{getCpuMemory({ targets, index, field: 'memory' })}
							</span>
							<span className="remove-target">
								{((!index && !!selectedTargets[index]?.instance) || !!index) && (
									<X onClick={() => removeTarget(index)} />
								)}
							</span>
						</div>
					);
				})}
			</div>
		</div>
	);
};
