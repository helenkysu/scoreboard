
const BASE_URL_DATE = "http://gd2.mlb.com/components/game/mlb";
const BASE_URL_GAME = "http://gd2.mlb.com"
const ACTIVE_STYLE = { background: '#e6f9ff' }



class Scoreboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fetch_error: false,
            game_list: [], 
            is_loading: false,
            ready: false,
        };

        this.createURL = this.createURL.bind(this);
        this.getDayData = this.getDayData.bind(this);
        this.handleSearchClick = this.handleSearchClick.bind(this);
        this.formatDate = this.formatDate.bind(this);
        this.handleClickNext = this.handleClickNext.bind(this);
        this.handleClickPrev = this.handleClickPrev.bind(this);
    }


    handleSearchClick(){
        var date_string = $('#datepicker').val();
        if(date_string){ //input field must not be empty
            var new_date = new Date(date_string);
            this.getDayData(new_date);
        }
    }

    //return a date string in format MM/DD/YYYY for the input box
    formatDate(date_obj){
        var month_string = ("0" + String(date_obj.getMonth()+ 1)).slice(-2); 
        var day_string = ("0" + String(date_obj.getDate())).slice(-2); 
        var year_string = String(date_obj.getFullYear());
        return month_string + "/" + day_string + "/" + year_string
    }
  
    handleClickNext(){
        var date_string = $('#datepicker').val();
        if(date_string){
            var new_date = new Date(date_string);
            var next_date = new Date(date_string);
            next_date.setDate(new_date.getDate() + 1)
            this.getDayData(next_date);
            $('#datepicker').val(this.formatDate(next_date));
        }

    }

    handleClickPrev(){
        var date_string = $('#datepicker').val();
        if(date_string){
            var new_date = new Date(date_string);
            var prev_date = new Date(date_string);
            prev_date.setDate(prev_date.getDate() - 1);
            this.getDayData(prev_date);
            $('#datepicker').val(this.formatDate(prev_date));
        }
    }

    getDayData(date_obj) {
        //display loading wheel
        this.setState({is_loading: true, fetch_error: false});

        var new_url = this.createURL(date_obj);
        //console.log(new_url)
        fetch(new_url).then(response => {
            console.log(response.status, response.statusCode);
            if (response.ok) {
                return response.json();
            } 
            else {
                throw "No Results";
            }
        })
        .then(json => {
            //console.log("GOT ", json.data);
            //console.log(json.data.games)
            if(json.data.games.game){
                if ($.isArray(json.data.games.game)){ //list of games
                    //separating out the favourite team games and adding them to the beginning of the list
                    var fav_game_list = [];
                    var fav_input = $('#fav-input').val();
                    var returned_game_list = json.data.games.game;
                    
                    if(fav_input){
                      for(var i = 0; i < returned_game_list.length; i++){
                            if(returned_game_list[i].home_team_name === fav_input || returned_game_list[i].away_team_name === fav_input){
                              var fav_game = returned_game_list[i]
                              returned_game_list.splice(i, 1); //removing the favourite team game
                              fav_game_list.push(fav_game); 
                            }
                      }
                      var new_list = fav_game_list.concat(returned_game_list);
                      this.setState({ game_list: new_list, is_loading: false });
                    }
                    else{ //no fav game input
                        this.setState({ game_list: returned_game_list, is_loading: false });
                    }       
                }
                else{ //there is only one game, add it to the empty list
                    this.setState({game_list: [json.data.games.game], is_loading: false})
                }
            }
            else{ //no games on this day, clear game_list
                 this.setState({game_list: [], is_loading: false});
            }
            //console.log(this.state.game_list)
        })
        .catch(error => {
            //search date may be in the future
            this.setState({fetch_error: true, is_loading: false, game_list: []}); 
            //console.log("fetch_error set")
            console.log(error);
        });
    }

    //create the URL that goes into fetch function in getDayData
    createURL(date_obj){
        var month_string = ("0" + String(date_obj.getMonth()+ 1)).slice(-2); 
        var day_string = ("0" + String(date_obj.getDate())).slice(-2); 
        var year_string = date_obj.getFullYear();
        var url = BASE_URL_DATE + "/year_" + year_string + "/month_" + month_string + "/day_" + day_string + "/master_scoreboard.json"
        //console.log(url)
        return url
    }

    render() {
        return (
            <div>
                {/*Buttons */}
                <div className="row">
                    <div className="col-lg-3 col-md-3 col-sm-1 col-xs-1">
                    </div>
                    <div className="col-lg-6 col-md-6 col-sm-10 col-xs-10 text-center">
                        <button className={this.state.is_loading ? "btn btn-info btn-md disabled":"btn btn-info btn-md"} onClick={this.handleClickNext}>&nbsp;&nbsp;Next Day&nbsp;&nbsp;
                        </button>
                        &nbsp;&nbsp;&nbsp;  
                        <button className={this.state.is_loading ? "btn btn-info btn-md disabled":"btn btn-info btn-md"} onClick={this.handleSearchClick}>Search</button>
                        &nbsp;&nbsp;&nbsp;
                        <button className={this.state.is_loading ? "btn btn-info btn-md disabled":"btn btn-info btn-md"} onClick={this.handleClickPrev}>Previous Day</button>
                    </div>
                    <div className="col-lg-3 col-md-3 col-sm-1 col-xs-1">
                    </div>
                </div>
                <br />

                {(this.state.fetch_error) ?
                    <h1 className="text-center blue-text">Sorry, we couldn't find results for this day (perhaps this is the future or your date is not in the form MM/DD/YYYY)</h1>
                :
                    <div>
                        {(this.state.is_loading) ?
                            <div className="row text-center">
                                <img className="loading-wheel" src="./images/loading-wheel.gif"/>
                                <h3 className="blue-text">Loading...</h3>
                            </div>
                        :
                            <div> 
                                {
                                    this.state.game_list.length === 0 ? 
                                        <h1 className="text-center blue-text">No games on this day</h1> 
                                    :
                                        <div>
                                            {this.state.game_list.map(( item, index) =>
                                              <Game key={index} game={item} id={index} />
                                            )}
                                        </div>
                                }
                          </div>
                        }
                    </div>
                }
            </div>
      );
    }
}


//each Row of Information in Scoreboard
class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            home_team_view: true, //for toggling between two team info
            game_data: null,
            linescore_data: null, 
            home_batters: [],
            away_batters: [],
            home_win: true,
            favourite_team: null,
        };

        this.getGameData = this.getGameData.bind(this);
    }

    getGameData(game_obj) {
        this.setState({game_data: null, linescore_data: null});
        var new_url = BASE_URL_GAME + game_obj.game_data_directory + "/boxscore.json";
        //console.log(new_url)
        fetch(new_url).then(response => {
            //console.log(response.status, response.statusCode);
            if (response.ok) {
                return response.json();
            } 
            else {
                throw "No Results";
            }
        })
        .then(json => {
            //console.log("Game data: ", json.data.boxscore);
            if(json.data.boxscore){
                this.setState({game_data: json.data.boxscore,
                              linescore_data: json.data.boxscore.linescore,
                              home_batters: json.data.boxscore.batting[0].batter,
                              away_batters: json.data.boxscore.batting[1].batter,
                })
                
                //recording the winner
                if(this.props.game.linescore.r.away && this.props.game.linescore.r.home){
                    if(this.props.game.linescore.r.away > this.props.game.linescore.r.home){
                        this.setState({home_win: false});
                    }
                }
            }
            
        })
        .catch(error => {
            console.log(error);
        });
    }

    componentDidMount(){
        if(this.props.game){
          this.getGameData(this.props.game);
        }
    }

    render() {
      return (
          //assuming that the home team is on the top
          <div>
              <div className="row">
                  <div className="col-lg-3 col-md-3 col-sm-2 col-xs-2">
                  </div>
                  <div className="col-lg-6 col-md-6 col-sm-8 col-xs-8">
                      <div>
                          {this.props.game ?
                              <div>
                                  {/*Bold and non bold Home team info */}
                                  <div className="row">
                                  {
                                  (this.props.game.status.status !== "Postponed" && this.props.game.status.status !== "Cancelled") ?
                                        <div>
                                            {(this.state.home_win) ? 
                                                <b>
                                                <div className="col-md-6 col-sm-8 col-xs-8">
                                                    {this.props.game.home_team_name}
                                                </div>
                                                <div className="col-md-6 col-sm-4 col-xs-4 text-right">
                                                    {
                                                    (this.props.game.linescore.r.home) ? 
                                                    this.props.game.linescore.r.home 
                                                : 
                                                    null
                                                }
                                                </div>
                                                </b>
                                            : 
                                                <div>
                                                    <div className="col-lg-6 col-md-6 col-sm-8 col-xs-8">
                                                        {this.props.game.home_team_name}
                                                    </div>
                                                    <div className="col-lg-6 col-md-6 col-sm-4 col-xs-4 text-right">
                                                    {
                                                       (this.props.game.linescore.r.home) ? 
                                                    this.props.game.linescore.r.home 

                                                    : 
                                                    null
                                                    }
                                                    </div>
                                                </div>
                                            }
                                          </div>
                                  :
                                  <div className="col-md-6 col-sm-8 col-xs-8">
                                      {this.props.game.home_team_name}
                                  </div>
                                  }
                                  </div>
                                 {/*Bold and non bold Away team info */}
                                  <div className="row">  
                                      { 
                                      (this.props.game.status.status !== "Postponed" && this.props.game.status.status !== "Cancelled") ?
                                            <div>
                                                {(!this.state.home_win) ?
                                                  <b> 
                                                  <div className="col-lg-6 col-md-6 col-sm-8 col-xs-8">
                                                      {this.props.game.away_team_name}
                                                  </div>
                                                  <div className="col-lg-6 col-md-6 col-sm-4 col-xs-4 text-right">
                                                        {(this.props.game.status.status !== "Postponed" && this.props.game.status.status !== "Cancelled" && this.props.game.linescore.r.away)
                                                        ? 
                                                            this.props.game.linescore.r.away 
                                                        : 
                                                            null}
                                                    </div>
                                                  </b>
                                                :
                                                    <div>
                                                        <div className="col-lg-6 col-md-6 col-sm-8 col-xs-8">
                                                            {this.props.game.away_team_name}
                                                        </div>

                                                        <div className="col-lg-6 col-md-6 col-sm-4 col-xs-4 text-right">
                                                            {(this.props.game.status.status !== "Postponed" && this.props.game.status.status !== "Cancelled" && this.props.game.linescore.r.away)?
                                                                  this.props.game.linescore.r.away 
                                                            : 
                                                                  null
                                                            }
                                                        </div>
                                                    </div>
                                                }
                                          </div>
                                      :
                                          <div className="col-md-6 col-sm-8 col-xs-8">
                                              {this.props.game.away_team_name}
                                          </div>
                                      }

                                  </div>
                              </div>
                          :
                              null
                          }
                      </div>
              
                      {/*Game Status */}
                      <h4>{this.props.game.status.status}</h4>

                      {/*Button for details popup */}
                      {(this.props.game.status.status !== "Postponed" && this.props.game.status.status !== "Cancelled") ?
                          <div>
                              <button type="button" className="btn btn-info btn-md" data-toggle="modal" data-target={"#myModal" + String(this.props.id)}>
                              Details
                              </button>
                          </div>
                          :
                          null
                      }
                      
                      <hr/>
                  </div>
                  <div className="col-lg-3 col-md-3 col-sm-2 col-xs-2">
                  </div>
          </div>

          <div>
          {/* The pop up part*/}
              <div id={"myModal" + String(this.props.id)} className="modal fade" role="dialog">
                  <div className="modal-dialog">
                      <div className="modal-content">
                          <div className="modal-header">
                              <button type="button" className="close" data-dismiss="modal">&times;</button>
                              <h4 className="modal-title">
                                  {
                                  this.state.game_data
                                  ? 
                                  <div>
                                      {this.props.game.home_team_name + " VS " + this.props.game.away_team_name + " at: " + this.state.game_data.venue_name}
                                  </div>
                                  :
                                  <div>
                                      Details
                                  </div>
                                  }
                              </h4>
                          </div>
                          <div className="modal-body">
                              {(this.state.game_data) && (this.state.linescore_data) && (this.state.away_batters.length !== 0) && (this.state.home_batters.length !== 0) && (this.state.linescore_data.inning_line_score) && ($.isArray(this.state.linescore_data.inning_line_score)) ?
                                      <div>
                                          <table>
                                              <tbody>
                                                <tr>
                                                    <th>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</th>
                                                    <th>1&nbsp;&nbsp;</th>
                                                    <th>2&nbsp;&nbsp;</th>
                                                    <th>3&nbsp;&nbsp;</th>
                                                    <th>4&nbsp;&nbsp;</th> 
                                                    <th>5&nbsp;&nbsp;</th>
                                                    <th>6&nbsp;&nbsp;</th> 
                                                    <th>7&nbsp;&nbsp;</th>
                                                    <th>8&nbsp;&nbsp;</th>
                                                    <th>9&nbsp;&nbsp;</th>
                                                    <th>R&nbsp;&nbsp;</th>
                                                    <th>H&nbsp;&nbsp;</th>
                                                    <th>E&nbsp;&nbsp;</th> 
                                                </tr>
                                                <tr>
                                                    <td>{this.props.game.home_name_abbrev}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
                                                    <td>{this.state.linescore_data.inning_line_score[0].home}</td>
                                                    <td>{this.state.linescore_data.inning_line_score[1].home}</td>
                                                    <td>{this.state.linescore_data.inning_line_score[2].home}</td>
                                                    <td>{this.state.linescore_data.inning_line_score[3].home}</td>
                                                    <td>{this.state.linescore_data.inning_line_score[4].home}</td>
                                                    <td>{this.state.linescore_data.inning_line_score[5].home}</td>
                                                    <td>{this.state.linescore_data.inning_line_score[6].home}</td>
                                                    <td>{this.state.linescore_data.inning_line_score[7].home}</td>
                                                    <td>{this.state.linescore_data.inning_line_score[8].home}</td>
                                                    <td>{this.state.linescore_data.home_team_runs}</td>
                                                    <td>{this.state.linescore_data.home_team_hits}</td>
                                                    <td>{this.state.linescore_data.home_team_errors}</td>
                                                </tr>
                                                <tr>
                                                    <td>{this.props.game.away_name_abbrev}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
                                                    <td>{this.state.linescore_data.inning_line_score[0].away}</td>
                                                    <td>{this.state.linescore_data.inning_line_score[1].away}</td>
                                                    <td>{this.state.linescore_data.inning_line_score[2].away}</td>
                                                    <td>{this.state.linescore_data.inning_line_score[3].away}</td>
                                                    <td>{this.state.linescore_data.inning_line_score[4].away}</td>
                                                    <td>{this.state.linescore_data.inning_line_score[5].away}</td>
                                                    <td>{this.state.linescore_data.inning_line_score[6].away}</td>
                                                    <td>{this.state.linescore_data.inning_line_score[7].away}</td>
                                                    <td>{this.state.linescore_data.inning_line_score[8].away}</td>
                                                    <td>{this.state.linescore_data.away_team_runs}</td>
                                                    <td>{this.state.linescore_data.away_team_hits}</td>
                                                    <td>{this.state.linescore_data.away_team_errors}</td>
                                               
                                                </tr>
                                            </tbody>
                                        </table>
                                        <br />
                                        <br />

                                        {/* The two different team views*/}
                                        <h3>
                                            <a onClick={() => this.setState({home_team_view: true})} style={this.state.home_team_view?  ACTIVE_STYLE : null}>
                                                  {this.state.game_data.home_sname}
                                            </a>
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                            <a onClick={() => this.setState({home_team_view: false})} style={!this.state.home_team_view ? ACTIVE_STYLE : null}>
                                                  {this.state.game_data.away_fname}
                                            </a>
                                        </h3>
                                        <table>
                                            <tbody>
                                                <tr>
                                                    <th>Name&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</th>
                                                    <th>AB&nbsp;&nbsp;</th>
                                                    <th>R&nbsp;&nbsp;&nbsp;</th>
                                                    <th>H&nbsp;&nbsp;&nbsp;</th>
                                                    <th>RBI&nbsp;</th> 
                                                    <th>BB&nbsp;&nbsp;</th>
                                                    <th>SO&nbsp;&nbsp;</th> 
                                                    <th>AVG</th> 
                                                </tr>
              
                                              {
                                                 (this.state.home_team_view) ? 
                                                      this.state.home_batters.map(( batter, index) => <BatterEntry batter={batter} key={index} id={index}/>
                                                      )
                                                  :
                                               
                                                      this.state.away_batters.map(( batter, index) => <BatterEntry batter={batter} key={index} id={index}/>
                                                      )   
                                              }
                                           
                                            </tbody>
                                        </table>
                                    </div>
                                :
                                  <div>
                                  "loading..."
                                  </div>
                                }
                          </div>
                          <div className="modal-footer">
                              <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
      );
    }
}

//For PopUp
class BatterEntry extends React.Component {
    constructor(props) {
        super(props);
    }
    render(){
        return(
            <tr>
                <td>{this.props.batter.name_display_first_last}</td>
                <td>{this.props.batter.ab}</td>
                <td>{this.props.batter.r}</td>
                <td>{this.props.batter.h}</td>
                <td>{this.props.batter.rbi}</td> 
                <td>{this.props.batter.bb}</td>
                <td>{this.props.batter.so}</td>
                <td>{this.props.batter.avg}</td>  
            </tr>
        );
    }
}

ReactDOM.render(<Scoreboard />, document.getElementById('root'));

