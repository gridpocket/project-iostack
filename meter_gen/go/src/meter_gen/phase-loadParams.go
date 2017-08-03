/**
 * GridPocket Copyrights 2017
 * IOSTACK project www.iostack.eu
 *
 * @Author: Nathaël Noguès, GridPocket SAS
 * @Date:   2017-07-13
 * @Last Modified by:   Nathaël Noguès
 * @Last Modified time: 2017-08-01
**/

package meter_gen

import (
	"fmt"
	"io/ioutil"
	"os"
	"strconv"
	"strings"
	"time"
)

func GetParameters(args []string) Params {
	if IndexOf(args, "-h") >= 0 || IndexOf(args, "--help") >= 0 {
		printHelp()
		os.Exit(0) // not an error
	}

	var argsMap = argsToMap(args)
	params, errCount := loadConfig(argsMap)
	if errCount > 0 {
		fmt.Println(errCount, "errors found.")
		fmt.Println("Type meter_gen -h to see how to use")
		os.Exit(-2) // parameters initialisation error
	}
	return params
}

func printHelp() {
	help, err := ioutil.ReadFile(GetMeterGenDir() + "/usageMessage.txt")
	if err != nil {
		panic(err)
	}

	fmt.Println(string(help))
}
func argsToMap(args []string) map[string]string {
	var argsMap = make(map[string]string)

	// reading all arguments one by one
	for len(args) > 0 {
		var a = args[0]
		args = args[1:] // shift array

		if a[0] == '-' {
			if len(args) > 0 {
				if args[0][0] == '-' {
					// next argument is starting with '-'
					// so set the value as boolean true
					argsMap[a[1:]] = "true"
				} else {
					// get argument, and pushing to map
					argsMap[a[1:]] = args[0]
					args = args[1:] // shift array
				}
			} else {
				argsMap[a[1:]] = ""
			}
		} else {
			// argument wasn't starting with '-', certainly an error.
			// Push it to map, will print error for this argument
			argsMap[a] = ""
		}
	}

	return argsMap
}

func loadConfig(argsMap map[string]string) (Params, int) {
	paramsMap, errors := loadConfigRecursive(argsMap, 0, make([]string, 0))
	fmt.Println("Loaded config from command line")

	var params Params
	const dateFormat = "2006-01-02T03:04"

	// Check missing not optional parameters here
	for _, key := range []string{"metersNumber", "firstDate", "lastDate", "interval"} {
		if _, hasKey := paramsMap[key]; !hasKey {
			fmt.Println("ERROR: " + key + " need to be specified")
			errors++
		}
	}

	// Set default optional values in Params
	params.out = "./%Y-%M-%D_%N.csv"
	params.metersType = TYPE_MIX

	// Importing parameters to Params object and checking format and values
	var err error
	const ERR_MSG_BEG = "ERROR: %v ('%v') "
	for key, value := range paramsMap {
		switch key {
		case "metersNumber": // uint64
			params.metersNumber, err = strconv.ParseUint(value, 10, 64)

			if err != nil {
				fmt.Printf(ERR_MSG_BEG+"is not a positive integer\n", key, value)
				errors++
			} else if params.metersNumber <= 0 {
				fmt.Printf(ERR_MSG_BEG+"is lower than 1\n", key, value)
				errors++
			}
		case "beginDate", "firstDate": // string: 'YYYY-MM-DDTHH:mm' > time.Time
			params.firstDate, err = time.Parse(dateFormat, value)
			if err != nil {
				fmt.Printf(ERR_MSG_BEG+"is not in format 'YYYY-MM-DDTHH:mm'\n", key, value)
				errors++
			}
		case "endDate", "lastDate": // string: 'YYYY-MM-DDTHH:mm' > time.Time
			params.lastDate, err = time.Parse(dateFormat, value)
			if err != nil {
				fmt.Printf(ERR_MSG_BEG+"is not in format 'YYYY-MM-DDTHH:mm'\n", key, value)
				errors++
			}
		case "interval": // int > time.Duration
			var interval int
			interval, err := strconv.Atoi(value)

			if err != nil {
				fmt.Printf(ERR_MSG_BEG+"is not a positive integer\n", key, value)
				errors++
			} else if interval <= 0 {
				fmt.Printf(ERR_MSG_BEG+"is lower than 1\n", key, value)
				errors++
			} else {
				params.interval = time.Duration(interval) * time.Minute
			}
		case "metersType": // string > TYPE_xxx
			if value[:3] == "mix" {
				params.metersType = TYPE_MIX
			} else if value[:3] == "ele" {
				params.metersType = TYPE_ELE
			} else if value[:3] == "gas" {
				params.metersType = TYPE_GAS
			} else {
				fmt.Printf(ERR_MSG_BEG+"is neither 'mix', 'elec' nor 'gas'\n", key, value)
				errors++
			}
		case "maxFileSize": // string: [1-9][0-9]*[obkmg] > uint64
			var unite = strings.ToLower(value)[len(value)-1]
			params.maxFileSize, err = strconv.ParseUint(value[:len(value)-1], 10, 64)

			if err != nil {
				fmt.Printf(ERR_MSG_BEG+"is not a positive integer followed by 'o'/'B', 'k', 'M' or 'G'\n", key, value)
				errors++
			} else if params.maxFileSize <= 0 {
				fmt.Printf(ERR_MSG_BEG+"is lower than 1B\n", key, value)
				errors++
			}

			switch unite {
			case 'g':
				params.maxFileSize *= 1024 // gigabyte
				fallthrough
			case 'm':
				params.maxFileSize *= 1024 // megabyte
				fallthrough
			case 'k':
				params.maxFileSize *= 1024 // kilobyte
				fallthrough
			case 'o', 'b': // byte
				/* nothing */
			default:
				fmt.Printf(ERR_MSG_BEG+"is a positive integer not followed by 'o'/'B', 'k', 'M' or 'G'\n", key, value)
				errors++
			}
		case "startID", "firstID": // uint64
			params.firstID, err = strconv.ParseUint(value, 10, 64)

			if err != nil {
				fmt.Printf(ERR_MSG_BEG+"is not a positive integer\n", key, value)
				errors++
			} else if params.firstID < 0 {
				fmt.Printf(ERR_MSG_BEG+"is lower than 0\n", key, value)
				errors++
			}
		case "lastID": // uint64
			params.lastID, err = strconv.ParseUint(value, 10, 64)

			if err != nil {
				fmt.Printf(ERR_MSG_BEG+"is not a positive integer\n", key, value)
				errors++
			} else if params.lastID <= 0 {
				fmt.Printf(ERR_MSG_BEG+"is lower than 1\n", key, value)
				errors++
			}
		case "temp": // bool
			if value == "" {
				params.temp = true
			} else {
				params.temp, err = strconv.ParseBool(strings.ToLower(value))
				if err != nil {
					fmt.Printf(ERR_MSG_BEG+"is not a boolean (true/t/1, false/f/0)\n", key, value)
					errors++
				}
			}
		case "location": // bool
			if value == "" {
				params.location = true
			} else {
				params.location, err = strconv.ParseBool(strings.ToLower(value))
				if err != nil {
					fmt.Printf(ERR_MSG_BEG+"is not a boolean (true/t/1, false/f/0)\n", key, value)
					errors++
				}
			}
		case "consumptionsFile": // string
			params.consumptionsFile = value
		case "climatFile": // string
			params.climatFile = value
		case "meteoFile": // string
			params.meteoFile = value
		case "locationsFile": // string
			params.locationsFile = value
		case "out": // string
			params.out = value
		case "debug": // bool
			if value == "" {
				params.debug = true // bool
			} else {
				params.debug, err = strconv.ParseBool(strings.ToLower(value))
				if err != nil {
					fmt.Printf(ERR_MSG_BEG+"is not a boolean (true/t/1, false/f/0)\n", key, value)
					errors++
				}
			}
		default:
			fmt.Printf("ERROR: Unrecognized parameter '"+key+"', value: '%v'\n", value)
			errors++
		}
	}

	// Set default optional values in Params
	if params.out[len(params.out)-1] == '/' {
		params.out += "%Y-%M-%D_%N.csv"
	}

	if params.lastID == 0 {
		params.lastID = params.metersNumber
	}

	// Check parameters compatibility
	if !params.lastDate.After(params.firstDate) {
		fmt.Printf(ERR_MSG_BEG+"should be before lastDate ('%v')\n", "firstDate", params.lastDate, params.firstDate)
		errors++
	}
	if params.firstID >= params.metersNumber {
		fmt.Printf(ERR_MSG_BEG+"should be lower than metersNumber ('%v')\n", "lastID", params.firstID, params.metersNumber)
		errors++
	}
	if params.lastID > params.metersNumber {
		fmt.Printf(ERR_MSG_BEG+"should be lower or equal than metersNumber ('%v')\n", "lastID", params.lastID, params.metersNumber)
		errors++
	}
	if params.lastID < params.firstID {
		fmt.Printf(ERR_MSG_BEG+"should be lower than lastID ('%v')\n", "firstID", params.firstID, params.lastID)
		errors++
	}
	if params.maxFileSize > 0 && !strings.Contains(params.out, "%N") {
		fmt.Printf(ERR_MSG_BEG+"need to contains '%%N' when maxFileSize ('%v') > 0 (to be replaced by file number during execution)", "out", params.out, params.maxFileSize)
		errors++
	}

	params.out = strings.Replace(params.out, "%Y", "%04[1]d", -1)
	params.out = strings.Replace(params.out, "%y", "%02[2]d", -1)
	params.out = strings.Replace(params.out, "%M", "%02[3]d", -1)
	params.out = strings.Replace(params.out, "%D", "%02[4]d", -1)
	params.out = strings.Replace(params.out, "%d", "%02[5]d", -1)
	params.out = strings.Replace(params.out, "%h", "%02[6]d", -1)
	params.out = strings.Replace(params.out, "%m", "%02[7]d", -1)
	params.out = strings.Replace(params.out, "%N", "%[8]s", -1)

	return params, errors
}

func loadConfigRecursive(argsMap map[string]string, errors int, recursive []string) (map[string]string, int) {
	const CONFIG_KEY string = "config"
	var params = make(map[string]string)

	if _, isConfig := argsMap[CONFIG_KEY]; !isConfig {
		// If no config file specified, and there is a ./config.json
		// use it as default config file

		var execConfig = GetExecutionDir() + "/config.json"
		var defaultConfig = GetMeterGenDir() + "/defaultconfig.json"

		execConfigExists, err1 := FileExists(execConfig)
		defaultConfigExists, err2 := FileExists(defaultConfig)

		if err1 != nil || err2 != nil {
			fmt.Println(err1, err2)
		} else if execConfigExists && IndexOf(recursive, execConfig) < 0 {
			argsMap[CONFIG_KEY] = GetExecutionDir() + "/config.json"
		} else if defaultConfigExists && IndexOf(recursive, defaultConfig) < 0 {
			argsMap[CONFIG_KEY] = GetMeterGenDir() + "/defaultconfig.json"
		}
	}

	configPath, isConfig := argsMap[CONFIG_KEY]
	if isConfig {
		if IndexOf(recursive, configPath) >= 0 {
			fmt.Println("ERROR:", CONFIG_KEY, "loop detected:", configPath, "is directly or indirectly referencing itself.")
			errors++
		} else {
			fileBytes, err := ioutil.ReadFile(configPath)
			if err != nil {
				fmt.Println("ERROR: Cannot read file '" + configPath + "'")
				errors++
				return nil, errors
			}

			jsonConfig, err := JsonToStrMap(fileBytes)
			if err != nil {
				fmt.Println("ERROR: Cannot convert file '" + configPath + "' content to json")
				errors++
				return nil, errors
			}

			if _, hasConfig := jsonConfig[CONFIG_KEY]; hasConfig {
				argsMap[CONFIG_KEY] = jsonConfig[CONFIG_KEY]
			} else {
				delete(argsMap, CONFIG_KEY)
			}
			delete(jsonConfig, CONFIG_KEY)

			// Add this file name to 'recursive' list, to maybe later detect recursivity loop
			recursive = append(recursive, configPath)

			// Get herited parameters
			params, errors = loadConfigRecursive(jsonConfig, 0, recursive)
			fmt.Println("Loaded config from", configPath)
		}
	}

	// Add new and rewrited parameters
	for key := range argsMap {
		params[key] = argsMap[key]
	}

	return params, errors
}
