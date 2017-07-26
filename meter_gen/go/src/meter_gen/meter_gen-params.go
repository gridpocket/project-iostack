/**
 * GridPocket Copyrights 2017
 * IOSTACK project www.iostack.eu
 *
 * @Author: Nathaël Noguès, GridPocket SAS
 * @Date:   2017-07-13
 * @Last Modified by:   Nathaël Noguès
 * @Last Modified time: 2017-07-26
**/

package meter_gen

import (
	"encoding/json"
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
	param, errCount := loadConfig(argsMap)
	if errCount > 0 {
		fmt.Println(errCount, "errors found.")
		fmt.Println("Type meter_gen -h to see how to use")
		os.Exit(-2) // parameters initialisation error
	}
	return param
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

	var param Params
	const dateFormat = "2006/01/02"

	// Check missing not optional parameters here
	for _, key := range []string{"metersNumber", "beginDate", "endDate", "interval"} {
		if _, hasKey := paramsMap[key]; !hasKey {
			fmt.Println("ERROR: " + key + " need to be specified")
			errors++
		}
	}

	// Set default optional values in Params
	param.out = "./%Y-%M-%D_%N.csv"

	// Importing parameters to Params object and checking format and values
	var err error
	const ERR_MSG_BEG = "ERROR: %v ('%v') "
	for key, value := range paramsMap {
		switch key {
		case "metersNumber": // uint64
			param.metersNumber, err = strconv.ParseUint(value, 10, 64)

			if err != nil {
				fmt.Printf(ERR_MSG_BEG+"is not a positive integer\n", key, value)
				errors++
			} else if param.metersNumber <= 0 {
				fmt.Printf(ERR_MSG_BEG+"is lower than 1\n", key, value)
				errors++
			}
			break
		case "beginDate": // string: 'YYYY-MM-DD' > time.Time
			param.beginDate, err = time.Parse(dateFormat, value)
			if err != nil {
				fmt.Printf(ERR_MSG_BEG+"is not in format 'YYYY/MM/DD'\n", key, value)
				errors++
			}
			break
		case "endDate": // string: 'YYYY-MM-DD' > time.Time
			param.endDate, err = time.Parse(dateFormat, value)
			if err != nil {
				fmt.Printf(ERR_MSG_BEG+"is not in format 'YYYY/MM/DD'\n", key, value)
				errors++
			}
			break
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
				param.interval = time.Duration(interval) * time.Minute
			}
			break
		case "metersType": // string > TYPE_xxx
			if value[:3] == "mix" {
				param.metersType = TYPE_MIX
			} else if value[:3] == "ele" {
				param.metersType = TYPE_ELE
			} else if value[:3] == "gas" {
				param.metersType = TYPE_GAS
			} else {
				fmt.Printf(ERR_MSG_BEG+"is neither 'mix', 'elec' nor 'gas'\n", key, value)
				errors++
			}
			break
		case "maxFileSize": // string: [1-9][0-9]*[obkmg] > uint64
			var unite = strings.ToLower(value)[len(value)-1]
			param.maxFileSize, err = strconv.ParseUint(value[:len(value)-1], 10, 64)

			if err != nil {
				fmt.Printf(ERR_MSG_BEG+"is not a positive integer followed by 'o'/'B', 'k', 'M' or 'G'\n", key, value)
				errors++
			} else if param.maxFileSize <= 0 {
				fmt.Printf(ERR_MSG_BEG+"is lower than 1B\n", key, value)
				errors++
			}

			switch unite {
			case 'g':
				param.maxFileSize *= 1024 // gigabyte
			case 'm':
				param.maxFileSize *= 1024 // megabyte
			case 'k':
				param.maxFileSize *= 1024 // kilobyte
			case 'o': // octet (French 'byte')
			case 'b': // byte
				break
			default:
				fmt.Printf(ERR_MSG_BEG+"is a positive integer not followed by 'o'/'B', 'k', 'M' or 'G'\n", key, value)
				errors++
			}
			break
		case "startID": // DEPRECATED /* act like firstID */
		case "firstID": // uint64
			param.firstID, err = strconv.ParseUint(value, 10, 64)

			if err != nil {
				fmt.Printf(ERR_MSG_BEG+"is not a positive integer\n", key, value)
				errors++
			} else if param.firstID < 0 {
				fmt.Printf(ERR_MSG_BEG+"is lower than 0\n", key, value)
				errors++
			}
			break
		case "lastID": // uint64
			param.lastID, err = strconv.ParseUint(value, 10, 64)

			if err != nil {
				fmt.Printf(ERR_MSG_BEG+"is not a positive integer\n", key, value)
				errors++
			} else if param.lastID <= 0 {
				fmt.Printf(ERR_MSG_BEG+"is lower than 1\n", key, value)
				errors++
			}
			break
		case "temp": // bool
			if value == "" {
				param.temp = true
			} else {
				param.temp, err = strconv.ParseBool(strings.ToLower(value))
				if err != nil {
					fmt.Printf(ERR_MSG_BEG+"is not a boolean (true/t/1, false/f/0)\n", key, value)
					errors++
				}
			}
			break
		case "location": // bool
			if value == "" {
				param.location = true
			} else {
				param.location, err = strconv.ParseBool(strings.ToLower(value))
				if err != nil {
					fmt.Printf(ERR_MSG_BEG+"is not a boolean (true/t/1, false/f/0)\n", key, value)
					errors++
				}
			}
			break
		case "consumptionsFile": // string
			param.consumptionsFile = value
			break
		case "climatFile": // string
			param.climatFile = value
			break
		case "meteoFile": // string
			param.meteoFile = value
			break
		case "locationsFile": // string
			param.locationsFile = value
			break
		case "out": // string
			param.out = value
			break
		case "debug": // bool
			if value == "" {
				param.debug = true // bool
			} else {
				param.debug, err = strconv.ParseBool(strings.ToLower(value))
				if err != nil {
					fmt.Printf(ERR_MSG_BEG+"is not a boolean (true/t/1, false/f/0)\n", key, value)
					errors++
				}
			}
			break
		default:
			fmt.Printf("ERROR: Unrecognized parameter '"+key+"', value: '%v'\n", value)
			errors++
		}
	}

	// Check parameters compatibility
	if !param.endDate.After(param.beginDate) {
		fmt.Printf(ERR_MSG_BEG+"should be before endDate ('%v')\n", "beginDate", param.endDate, param.beginDate)
		errors++
	}
	if param.firstID >= param.metersNumber {
		fmt.Printf(ERR_MSG_BEG+"should be lower than metersNumber ('%v')\n", "lastID", param.firstID, param.metersNumber)
		errors++
	}
	if param.lastID > param.metersNumber {
		fmt.Printf(ERR_MSG_BEG+"should be lower or equal than metersNumber ('%v')\n", "lastID", param.lastID, param.metersNumber)
		errors++
	}
	if param.lastID < param.firstID {
		fmt.Printf(ERR_MSG_BEG+"should be lower than lastID ('%v')\n", "firstID", param.firstID, param.lastID)
		errors++
	}
	if param.out[len(param.out)-1] == '/' {
		param.out += "%Y-%M-%D_%N.csv"
	}
	if param.maxFileSize > 0 && !strings.Contains(param.out, "%N") {
		fmt.Printf(ERR_MSG_BEG+"need to contains '%%N' when maxFileSize ('%v') > 0 (to be replaced by file number during execution)", "out", param.out, param.maxFileSize)
		errors++
	}

	return param, errors
}

func loadConfigRecursive(argsMap map[string]string, errors int, recursive []string) (map[string]string, int) {
	const CONFIG_KEY string = "config"
	var param = make(map[string]string)

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
			var jsonConfig map[string]interface{}
			var stringConfig = make(map[string]string)

			fileStr, err := ioutil.ReadFile(configPath)
			if err != nil {
				panic(err)
			}

			err = json.Unmarshal(fileStr, &jsonConfig) // get config file as json object
			if err != nil {
				panic(err)
			}

			for key, val := range jsonConfig {
				stringConfig[key] = fmt.Sprint(val)
			}

			if _, hasConfig := stringConfig[CONFIG_KEY]; hasConfig {
				argsMap[CONFIG_KEY] = stringConfig[CONFIG_KEY]
			} else {
				delete(argsMap, CONFIG_KEY)
			}
			delete(stringConfig, CONFIG_KEY)

			// Add this file name to 'recursive' list, to maybe later detect recursivity loop
			recursive = append(recursive, configPath)

			// Get herited parameters
			param, errors = loadConfigRecursive(stringConfig, 0, recursive)
			fmt.Println("Loaded config from", configPath)
		}
	}

	// Add new and rewrited parameters
	for key, _ := range argsMap {
		param[key] = argsMap[key]
	}

	return param, errors
}
