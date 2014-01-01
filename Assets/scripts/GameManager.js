﻿#pragma strict

class GameManager extends ScriptableObject {
  enum GameState { Init, Menu, Game, Quit };

  private static var _instance : GameManager;
  private var _levelManager : LevelManager;
  private var _audioOutput : AudioListener;
  private var _musicManager : MusicManager;
  private var _splash : GameObject;
  private var _state : GameState;
  private var _instanceInitialized = false;
  private var _stateInitialized = false;

  static function Instance() {
    if (!_instance) {
      _instance = ScriptableObject.CreateInstance('GameManager') as GameManager;
    }
    return _instance;
  }

  function OnEnable() {
    if (!_instanceInitialized) {
      _levelManager = LevelManager.Instance(this);
      _audioOutput = Camera.main.GetComponent.<AudioListener>();
      _musicManager = Camera.main.GetComponent.<MusicManager>();
      _splash = GameObject.Find('Splash');
    }
  }

  function Update() {
    if (!_stateInitialized && _musicManager.isLoaded) {
      initApp();
      SetState(GameState.Menu);
      _stateInitialized = true;
    }
    // Quit on Escape.
    if (Input.GetKeyDown(KeyCode.Escape)) {
      #if UNITY_WEBPLAYER || UNITY_EDITOR
        SetState(GameState.Menu);
      #else
        SetState(GameState.Quit);
      #endif
    }
    if (Input.GetKeyDown(KeyCode.M)) {
      _audioOutput.volume = 1 - _audioOutput.volume;
    }
  }

  function SetState(nextState : GameState) {
    Debug.Log('Game state: ' + _state.ToString() + ' to ' + nextState.ToString());
    if (nextState == _state) return;
    switch(nextState) {
      case GameState.Menu:
        _levelManager.resetBoard();
        showMenu();
        break;
      case GameState.Game:
        _musicManager.fadeStop(function(){
          _musicManager.cueNextTrack(function() {
            _musicManager.maxVolume = 0.9;
            hideMenu();
            _levelManager.StartLevel(0);
          });
        });
        break;
      case GameState.Quit:
        _musicManager.fadeStop();
        iTween.CameraFadeTo(iTween.Hash(
          'amount', 1.0
          ,'time', 1.0
          ,'oncomplete', 'GameQuit'
          ,'oncompletetarget', GameObject.Find('Loader')
          ,'ignoretimescale', true
        ));
        break;
    }
    _state = nextState;
  }

  function GetState() : GameState {
    return _state;
  }

  private function initApp() {
    iTween.CameraFadeAdd();
    iTween.CameraFadeFrom(1.0, 1.0);
  }

  private function showMenu() {
    Debug.Log('showing menu!');
    _musicManager.fadeStop(function() {
      _musicManager.maxVolume = 0.25;
      _musicManager.fadePlay(function(){
        _musicManager.playMore();
      });
    });
    var centerPosition = Screen2D.worldCenterAtZ(_splash);
    iTween.MoveTo(_splash, iTween.Hash(
      'position', centerPosition
      ,'easetype', 'easeInOutBack'
      ,'time', 1.0
    ));
  }

  private function hideMenu() {
Debug.Log('splash: ' + _splash);
    // iTween.RotateBy(_splash, iTween.Hash(
    //   'amount', Vector3(0,0,0.05)
    //   ,'easetype', 'easeInOutBack'
    //   ,'time', 1.0
    // ));
    // iTween.MoveTo(_splash, iTween.Hash(
    //   'position', _splash.transform.position + Vector3(-Screen2D.worldWidth() * 1.5,0,0)
    //   ,'easetype', 'easeInOutBack'
    //   ,'time', 1.0
    // ));
    iTween.MoveTo(_splash, iTween.Hash(
      'position', _splash.transform.position + Vector3(0, Screen2D.worldHeight() * 1.5, 0)
      ,'easetype', 'easeInOutBack'
      ,'time', 1.0
    ));
  }
}
