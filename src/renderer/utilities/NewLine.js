exports.encode = text => {
  if (text.indexOf("\r\n") > -1) {
    return "CRLF"
  } else if (text.indexOf("\r") > -1) {
    return "CR"
  }

  return "LF"
}

exports.decode = enc => {
  switch (enc) {
    case "CRLF":
      return "\r\n"
    case "CR":
      return "\r"
    default:
      return "\n"
  }
}
