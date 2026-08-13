<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Game;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class GameController extends Controller
{
    public function index()
    {
        $games = Game::withCount('products')->get();
        return view('admin.games.index', compact('games'));
    }

    public function create()
    {
        return view('admin.games.create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'logo' => 'nullable|image|max:2048',
            'banner' => 'nullable|image|max:4096',
            'description' => 'nullable|string',
            'category' => 'nullable|string',
        ]);

        $game = new Game();
        $game->name = $request->name;
        $game->slug = Str::slug($request->name);
        $game->description = $request->description;
        $game->category = $request->category;
        
        if ($request->hasFile('logo')) {
            $game->logo_path = $request->file('logo')->store('logos', 'public');
        }

        if ($request->hasFile('banner')) {
            $game->banner_path = $request->file('banner')->store('banners', 'public');
        }

        $game->save();

        return redirect()->route('admin.games.index')->with('success', 'Game created successfully.');
    }

    public function edit(Game $game)
    {
        return view('admin.games.edit', compact('game'));
    }

    public function update(Request $request, Game $game)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'logo' => 'nullable|image|max:2048',
            'banner' => 'nullable|image|max:4096',
            'description' => 'nullable|string',
            'category' => 'nullable|string',
        ]);

        $game->name = $request->name;
        $game->slug = Str::slug($request->name);
        $game->description = $request->description;
        $game->category = $request->category;
        
        if ($request->hasFile('logo')) {
            $game->logo_path = $request->file('logo')->store('logos', 'public');
        }

        if ($request->hasFile('banner')) {
            $game->banner_path = $request->file('banner')->store('banners', 'public');
        }

        $game->save();

        return redirect()->route('admin.games.index')->with('success', 'Game updated successfully.');
    }

    public function destroy(Game $game)
    {
        $game->delete();
        return redirect()->route('admin.games.index')->with('success', 'Game deleted successfully.');
    }
}
