import type { PythonLesson } from "../types";
import { mathInPython } from "./math-in-python";
import { novaStatusReport } from "./nova’s-status-report";
import { powerUpTheRobot } from "./power-up-the-robot";
import { practiceUsingPrint } from "./practice-using-print";
import { variablesPractice } from "./variables-practice";
import { syntaxErrors } from "./syntax-errors";
import { howToGetUserInput } from "./how-to-get-user-input";


export const pythonLessons: PythonLesson[] = [powerUpTheRobot, practiceUsingPrint, variablesPractice, novaStatusReport, mathInPython, syntaxErrors, howToGetUserInput];
