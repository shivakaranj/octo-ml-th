import axios from 'axios';
import { HardwareTargetsShape } from '../lib/types';

export const getHardwareTargets = async () => {
	const response = await axios
		.get<HardwareTargetsShape>('http://netheria.takehome.octoml.ai/hardware')
		.catch((e) => {
			return e;
		});
	return response.data;
};

export const octomizeAction = async (action, actionBody) => {
	return await axios.post(`http://netheria.takehome.octoml.ai/${action}`, { ...actionBody });
};
