//go:build wasm

package main

import (
	"encoding/json"
	"syscall/js"
)

// ParseJSValue parses a js.Value into a Go interface{}, returning nil if the value is not a valid JSON object.
func ParseJSValue(v js.Value) interface{} {
	var data interface{}
	err := UnmarshalJSValue(v, &data)
	if err != nil {
		return nil
	}
	return data
}

// GenerateJSValue generates a js.Value from a Go interface{}. If the data cannot be marshalled into JSON, js.Undefined() is returned.
func GenerateJSValue(data interface{}) js.Value {
	v, err := MarshalJSValue(data)
	if err != nil {
		return js.Undefined()
	}
	return v
}

func UnmarshalJSValue(v js.Value, data interface{}) error {
	str := js.Global().Get("JSON").Call("stringify", v).String()
	return json.Unmarshal([]byte(str), data)
}

func MarshalJSValue(data interface{}) (js.Value, error) {
	b, err := json.Marshal(data)
	if err != nil {
		return js.Undefined(), err
	}
	return js.Global().Get("JSON").Call("parse", string(b)), nil
}

func RegisterFunc(obj js.Value, p string, fn func(this js.Value, args []js.Value) (any, error)) {
	obj.Set(p, js.FuncOf(func(this js.Value, p []js.Value) interface{} {
		data, err := fn(this, p)
		if err != nil {
			return map[string]interface{}{
				"error": err.Error(),
			}
		}
		ret, err := json.Marshal(map[string]interface{}{
			"data": data,
		})
		if err != nil {
			return map[string]interface{}{
				"error": err.Error(),
			}
		}
		return js.Global().Get("JSON").Call("parse", string(ret))
	}))
}
