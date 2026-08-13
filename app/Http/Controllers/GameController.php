<?php

namespace App\Http\Controllers;

use App\Models\Game;
use Illuminate\Http\Request;

class GameController extends Controller
{
    public function index()
    {
        $games = Game::where('is_active', true)->take(6)->get();
        return view('home', compact('games'));
    }

    public function list()
    {
        $games = Game::where('is_active', true)->get();
        return view('games.index', compact('games'));
    }

    public function show(Game $game)
    {
        $products = $game->products()->where('is_published', true)->get();
        $packages = [];
        if ($game->slug === 'free-fire') {
            $packages = \App\Models\Package::where('is_active', true)->get();
        }
        return view('games.show', compact('game', 'products', 'packages'));
    }

    public function verifyPlayer(Request $request, Game $game, $uid)
    {
        // Validation: Return error if UID is empty
        if (empty($uid)) {
            return response()->json([
                'success' => false,
                'message' => 'Please enter your Player ID first'
            ], 400);
        }

        if ($game->slug === 'free-fire') {
            $useruid = 'Xv00AKjlBJMgOpxr05VP2Sreu0z1';
            $apiKey = 'Kjt47EN5VEvYVa77afIsd4hEAFicFg';
            $url = "https://proapis.hlgamingofficial.com/main/games/freefire/account/api?sectionName=AllData&PlayerUid={$uid}&region=sg&useruid={$useruid}&api={$apiKey}";

            try {
                $response = \Illuminate\Support\Facades\Http::get($url);

                if ($response->successful()) {
                    $data = $response->json();
                    
                    if (isset($data['result']['AccountInfo'])) {
                        $accountInfo = $data['result']['AccountInfo'];
                        return response()->json([
                            'success' => true,
                            'data' => [
                                'uid' => $uid,
                                'nickname' => $accountInfo['AccountName'] ?? 'Unknown',
                                'level' => $accountInfo['AccountLevel'] ?? 'N/A',
                                'region' => $accountInfo['AccountRegion'] ?? 'N/A',
                                'avatar' => null 
                            ]
                        ]);
                    } else {
                        // Sometimes the API might return an error message in the body
                        $errorMsg = $data['message'] ?? 'Player not found or invalid response from API';
                        return response()->json([
                            'success' => false,
                            'message' => $errorMsg
                        ], 404);
                    }
                } else {
                    return response()->json([
                        'success' => false,
                        'message' => 'Failed to connect to the verification API'
                    ], 500);
                }
            } catch (\Exception $e) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error verifying player: ' . $e->getMessage()
                ], 500);
            }
        }

        // Mock Logic for other games
        if (!preg_match('/^\d{8,15}$/', $uid)) {
            return response()->json([
                'success' => false,
                'message' => 'Player not found. Please check your ID'
            ], 404);
        }

        // Simulate returning successful player details
        return response()->json([
            'success' => true,
            'data' => [
                'uid' => $uid,
                'nickname' => 'Player_' . substr($uid, 0, 4),
                'level' => rand(30, 80),
                'region' => 'Global',
                'avatar' => null 
            ]
        ]);
    }
}
