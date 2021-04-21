var Lastkey = "";
var Lists = {};

var EndList = [];

module.exports = {
    Parse: function (input, indent, wasSub) {
        var output = {
            remove: false,
            change: false,
            value: "",

            beforeSpaces: 0,
            nextSpaces: 0
        };

        var spaces = 0;
        var sep = "";

        var factor1 = input.substr(12, 14).trim();
        var opcode = input.substr(26, 10).trim().toUpperCase();
        var plainOp = "";
        var extender = "";
        var factor2 = input.substr(36, 14).trim();
        var extended = input.substr(36).trim();
        var result = input.substr(50, 14).trim();

        var ind1 = input.substr(71, 2).trim();
        var ind2 = input.substr(73, 2).trim();
        var ind3 = input.substr(75, 2).trim();

        var condition = {
            not: (input.substr(9, 1).toUpperCase() === "N"),
            ind: input.substr(10, 2).trim()
        };

        var arrayoutput = [];

        plainOp = opcode;
        if (plainOp.indexOf('(') >= 0) {
            plainOp = opcode.substr(0, opcode.indexOf('('));
            extender = opcode.substring(opcode.indexOf('(')+1, opcode.indexOf(')'));
        }

        switch (plainOp) {
            case "PLIST":
            case "KLIST":
                LastKey = factor1.toUpperCase();
                Lists[LastKey] = [];
                output.remove = true;
                break;
            case "PARM":
            case "KFLD":
                //Handle var declaration
               Lists[LastKey].push(result);
	           output.remove = true;
                break;
            case "ADD":
                if (factor1)
                    output.value = result + " = " + factor1 + " + " + factor2;
                else
                    output.value = result + " = " + result + " + " + factor2;
                break;
            case "BEGSR":
                output.value = opcode + " " + factor1;
                output.nextSpaces = indent;
                break;
            case "CAT":
                if (factor2.indexOf(":") >= 0) {
                    spaces = Number(factor2.split(':')[1]);
                    factor2 = factor2.split(':')[0].trim();
                }
                output.value = result + " = " + factor1 + "+ '" + "".padStart(spaces) + "' + " + factor2;
                break;
            case "CALL":
                factor2 = factor2.substring(1, factor2.length-1);
                if (Lists[result.toUpperCase()])
                    output.value = factor2 + "(" + Lists[result.toUpperCase()].join(':') + ")";
                else
                    output.value = factor2 + '()';
                break;
            case "CHAIN":
                if (Lists[factor1.toUpperCase()])
                    output.value = opcode + " (" + Lists[factor1.toUpperCase()].join(':') + ") " + factor2 + " " + result;
                else
                    output.value = opcode + " " + factor1 + " " + factor2 + " " + result;
                break;
            case "CHECK":
                output.value = result + " = %Check(" + factor1 + ":" + factor2 + ")";
                break;
            case "CHECKR":
                output.value = result + " = %CheckR(" + factor1 + ":" + factor2 + ")";
                break;
            case "CLEAR":
                output.value = opcode + " " + factor1 + " " + factor2 + " " + result;
                break;
            case "CLOSE":
                output.value = opcode + " " + factor2;
                break;
            case "DELETE":
                output.value = opcode + " " + factor2;
                break;
            case "DIV":
                output.value = result + " = " + factor1 + " / " + factor2;
                break;
            case "DO":
                output.value = "For " + result + " = " + factor1 + " to " + factor2;
                output.nextSpaces = indent;
                EndList.push('Enddo');
                break;
            case "DOU":
            case "DOW":
                output.value = opcode + " " + extended;
                output.nextSpaces = indent;
                EndList.push('Enddo');
                break;
            case "DOWEQ":
                output.value = "Dow " + factor1 + " = " + factor2;
                output.nextSpaces = indent;
                EndList.push('Enddo');
                break;
            case "DOWNE":
                output.value = "Dow " + factor1 + " <> " + factor2;
                output.nextSpaces = indent;
                EndList.push('Enddo');
                break;
            case "DOWGT":
                output.value = "Dow " + factor1 + " > " + factor2;
                output.nextSpaces = indent;
                EndList.push('Enddo');
                break;
            case "DOWLT":
                output.value = "Dow " + factor1 + " < " + factor2;
                output.nextSpaces = indent;
                EndList.push('Enddo');
                break;
            case "DOWGE":
                output.value = "Dow " + factor1 + " >= " + factor2;
                output.nextSpaces = indent;
                EndList.push('Enddo');
                break;
            case "DOWLE":
                output.value = "Dow " + factor1 + " <= " + factor2;
                output.nextSpaces = indent;
                EndList.push('Enddo');
                break;
            case "DSPLY":
                output.value = opcode + " (" + factor1 + ") " + factor2 + " " + result;
                break;
            case "ELSE":
                output.beforeSpaces = -indent;
                output.value = opcode + " " + factor2;
                output.nextSpaces = indent;
                break;
            case "ELSEIF":
                output.beforeSpaces = -indent;
                output.value = opcode + " " + factor2;
                output.nextSpaces = indent;
                break;
            case "END":
                if (EndList.length > 0) {
                    output.beforeSpaces = -indent;
                    output.value = EndList.pop();
                } else {
                    output.message = "Operation " + plainOp + " will not convert; no matching block found.";
                }
                break;
            case "ENDDO":
                output.beforeSpaces = -indent;
                output.value = opcode;
                EndList.pop()
                break;
            case "ENDIF":
                output.beforeSpaces = -indent;
                output.value = opcode;
                EndList.pop()
                break;
            case "ENDMON":
                output.beforeSpaces = -indent;
                output.value = opcode;
                break;
            case "ENDSL":
                output.beforeSpaces = -(indent*2);
                output.value = opcode;
                EndList.pop()
                break;
            case "ENDSR":
                output.beforeSpaces = -indent;
                output.value = opcode;
                break;
            case "CALLP":
            case "EVAL":
                output.value = extended;
                break;
            case "EVALR":
                output.value = opcode + " " + extended;
                break;
            case "EXCEPT":
                output.value = opcode + " " + factor2;
                break;
            case "EXFMT":
                output.value = opcode + " " + factor2;
                break;
            case "EXSR":
                output.value = opcode + " " + factor2;
                break;
            case "FOR":
                output.value = opcode + " " + extended;
                output.nextSpaces = indent;
                break;
            case "ANDEQ":
                output.aboveKeywords = "AND " + factor1 + " = " + factor2;
                break;
            case "ANDNE":
                output.aboveKeywords = "AND " + factor1 + " <> " + factor2;
                break;
            case "IF":
                output.value = opcode + " " + extended;
                output.nextSpaces = indent;
                EndList.push('Endif');
                break;
            case "IFGT":
                output.value = "If " + factor1 + " > " + factor2;
                output.nextSpaces = indent;
                EndList.push('Endif');
                break;
            case "IFLT":
                output.value = "If " + factor1 + " < " + factor2;
                output.nextSpaces = indent;
                EndList.push('Endif');
                break;
            case "IFEQ":
                output.value = "If " + factor1 + " = " + factor2;
                output.nextSpaces = indent;
                EndList.push('Endif');
                break;
            case "IFNE":
                output.value = "If " + factor1 + " <> " + factor2;
                output.nextSpaces = indent;
                EndList.push('Endif');
                break;
            case "IFGE":
                output.value = "If " + factor1 + " >= " + factor2;
                output.nextSpaces = indent;
                EndList.push('Endif');
                break;
            case "IFLE":
                output.value = "If " + factor1 + " <= " + factor2;
                output.nextSpaces = indent;
                EndList.push('Endif');
                break;
            case "IN":
                output.value = opcode + " " + factor1 + " " + factor2;
                break;
            case "ITER":
                output.value = opcode;
                break;
            case "LEAVE":
                output.value = opcode;
                break;
            case "LEAVESR":
                output.value = opcode;
                break;
            case "LOOKUP":
                output.value = "*In" + ind3 + " = (%Lookup(" + factor1 + ":" + factor2 + ") > 0)";
                break;
            case "MONITOR":
                output.value = opcode;
                output.nextSpaces = indent;
                break;
            case "MOVE":
            case "MOVEL":
                output.move = {
                    target: result,
                    source: factor2,
                    attr: factor1,
                    dir: plainOp,
                    padded: (extender === "P")
                }
                break;
            case "MULT":
                output.value = result + " = " + factor1 + " * " + factor2;
                break;
            case "ON-ERROR":
                output.beforeSpaces = -indent;
                output.value = opcode + " " + factor2;
                output.nextSpaces = indent;
                break;
            case "OPEN":
                output.value = opcode + " " + factor2;
                break;
            case "OUT":
                output.value = opcode + " " + factor1 + " " + factor2;
                break;
            case "OTHER":
                output.beforeSpaces = -indent;
                output.value = opcode;
                output.nextSpaces = indent;
                break;
            case "READ":
            case "READC":
                output.value = opcode + " " + factor2 + " " + result;
                break;
            case "READE":
                if (Lists[factor1.toUpperCase()])
                    output.value = opcode + " (" + Lists[factor1.toUpperCase()].join(':') + ") " + factor2 + " " + result;
                else
                    output.value = opcode + " " + factor1 + " " + factor2 + " " + result;
                break;
            case "READP":
                output.value = opcode + " " + factor2 + " " + result;
                break;
            case "READPE":
                if (Lists[factor1.toUpperCase()])
                    output.value = opcode + " (" + Lists[factor1.toUpperCase()].join(':') + ") " + factor2 + " " + result;
                else
                    output.value = opcode + " " + factor1 + " " + factor2 + " " + result;
                break;
            case "RETURN":
                output.value = opcode + " " + factor2;
                break;
            case "SCAN":
                output.value = result + " = %Scan(" + factor1 + ":" + factor2 + ")";
                break;
            case "SELECT":
                output.value = opcode;
                output.nextSpaces = (indent*2);
                EndList.push('Endsl');
                break;
            case "SETGT":
                if (Lists[factor1.toUpperCase()])
                    output.value = opcode + " (" + Lists[factor1.toUpperCase()].join(':') + ") " + factor2;
                else
                    output.value = opcode + " " + factor1 + " " + factor2;
                break;
            case "SETLL":
                if (Lists[factor1.toUpperCase()])
                    output.value = opcode + " (" + Lists[factor1.toUpperCase()].join(':') + ") " + factor2;
                else
                    output.value = opcode + " " + factor1 + " " + factor2;
                break;
            case "SORTA":
                output.value = opcode + " " + extended;
                break;
            case "SUB":
                output.value = result + " = " + factor1 + " - " + factor2;
                break;
            case "SETOFF":
                if (ind1 != "") arrayoutput.push("*In" + ind1 + " = *Off;");
                if (ind2 != "") arrayoutput.push("*In" + ind2 + " = *Off;");
                if (ind3 != "") arrayoutput.push("*In" + ind3 + " = *Off;");
                break;
            case "SETON":
                if (ind1 != "") arrayoutput.push("*In" + ind1 + " = *On;");
                if (ind2 != "") arrayoutput.push("*In" + ind2 + " = *On;");
                if (ind3 != "") arrayoutput.push("*In" + ind3 + " = *On;");
                break;
            case "SUBST":
                if (factor2.indexOf(":") >= 0) {
                    sep = factor2.split(':')[1];
                    factor2 = factor2.split(':')[0].trim();
                }
                output.value = result + " = %Subst(" + factor2 + ":" + sep + ":" + factor1 + ")";
                break;
            case "UNLOCK":
                output.value = opcode + " " + factor2;
                break;
            case "UPDATE":
                output.value = opcode + " " + factor2 + " " + result;
                break;
            //TODO: Other WHEN conditions
            case "WHEN":
                output.beforeSpaces = -indent;
                output.value = opcode + " " + extended;
                output.nextSpaces = indent;
                break;
            case "WHENEQ":
                output.beforeSpaces = -indent;
                output.value = "When " + factor1 + " = " + factor2;
                output.nextSpaces = indent;
                break;
            case "WRITE":
                output.value = opcode + " " + factor2 + " " + result;
                break;
            case "Z-ADD":
                output.value = result + " = 0 + " + factor2;
                break;
            case "Z-SUB": 
                output.value = result + " = 0 - " + factor2;
                break;

            case "TIME":
                output.value = result + " = %Time()";
                break;
            
            default:
                if (plainOp == "") {
                    if (extended !== "") {
                        output.aboveKeywords = extended;
                    } else {
                        //Set to blank
                        output.change = true;
                        output.value = "";
                    }
                } else {
                    output.message = "Operation " + plainOp + " will not convert.";
                }
                break;
        }

        if (output.value !== "") {
            output.change = true;
            output.value = output.value.trimRight() + ';';
        }

        if (condition.ind !== "" && output.change) {
            arrayoutput.push("If" + (condition.not ? " NOT" : "") + " *In" + condition.ind + ";");
            arrayoutput.push("  " + output.value);
            arrayoutput.push('Endif;');
        }

        if (arrayoutput.length > 0) {
            output.change = true;
            output.arrayoutput = arrayoutput;
        }
        return output;
    }
}
