module.exports = {
  /**
   * build an HTML response with status 4xx
   * @param res response object
   * @param status http code in 4xx range
   * @param reason error description
   */
  res4xx: function (res, status, reason) {
    res.status(status).send({error: reason});
  },

  /**
   * build standard HTML response with status 200
   * @param res
   */
  resOk: function (res) {
    res.send({success: true});
  }
};