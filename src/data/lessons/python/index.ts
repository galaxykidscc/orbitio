import type { PythonLesson } from "../types";
import { novaStatusReport } from "./nova’s-status-report";
import { powerUpTheRobot } from "./power-up-the-robot";
import { practiceUsingPrint } from "./practice-using-print";
import { variablesPractice } from "./variables-practice";

export const pythonLessons: PythonLesson[] = [powerUpTheRobot, practiceUsingPrint, variablesPractice, novaStatusReport];
