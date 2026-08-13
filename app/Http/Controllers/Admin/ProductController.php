<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Game;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->get('search');
        $gameId = $request->get('game_id');

        $products = Product::with('game')
            ->when($search, function($query, $search) {
                return $query->where('name', 'like', "%{$search}%");
            })
            ->when($gameId, function($query, $gameId) {
                return $query->where('game_id', $gameId);
            })
            ->latest()
            ->paginate(20)
            ->withQueryString();

        $games = Game::orderBy('name')->get();

        return view('admin.products.index', compact('products', 'games'));
    }

    public function create()
    {
        $games = Game::orderBy('name')->get();
        return view('admin.products.create', compact('games'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'game_id' => 'required|exists:games,id',
            'name' => 'required|string|max:255',
            'normal_price' => 'required|numeric|min:0',
            'silver_price' => 'required|numeric|min:0|lt:normal_price',
            'gold_price' => 'required|numeric|min:0|lt:silver_price',
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:2048',
            'is_published' => 'boolean',
        ], [
            'silver_price.lt' => 'Silver price must be less than normal price.',
            'gold_price.lt' => 'Gold price must be less than silver price.'
        ]);

        $product = new Product();
        $product->game_id = $request->game_id;
        $product->name = $request->name;
        $product->slug = Str::slug($request->name) . '-' . uniqid();
        $product->normal_price = $request->normal_price;
        $product->silver_price = $request->silver_price;
        $product->gold_price = $request->gold_price;
        $product->description = $request->description;
        $product->is_published = $request->has('is_published');

        if ($request->hasFile('image')) {
            $product->image_path = $request->file('image')->store('products', 'public');
        }

        $product->save();

        return redirect()->route('admin.products.index')->with('success', 'Product created successfully.');
    }

    public function edit(Product $product)
    {
        $games = Game::orderBy('name')->get();
        return view('admin.products.edit', compact('product', 'games'));
    }

    public function update(Request $request, Product $product)
    {
        $request->validate([
            'game_id' => 'required|exists:games,id',
            'name' => 'required|string|max:255',
            'normal_price' => 'required|numeric|min:0',
            'silver_price' => 'required|numeric|min:0|lt:normal_price',
            'gold_price' => 'required|numeric|min:0|lt:silver_price',
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:2048',
            'is_published' => 'boolean',
        ], [
            'silver_price.lt' => 'Silver price must be less than normal price.',
            'gold_price.lt' => 'Gold price must be less than silver price.'
        ]);

        $product->game_id = $request->game_id;
        $product->name = $request->name;
        $product->normal_price = $request->normal_price;
        $product->silver_price = $request->silver_price;
        $product->gold_price = $request->gold_price;
        $product->description = $request->description;
        $product->is_published = $request->has('is_published');

        if ($request->hasFile('image')) {
            $product->image_path = $request->file('image')->store('products', 'public');
        }

        $product->save();

        return redirect()->route('admin.products.index')->with('success', 'Product updated successfully.');
    }

    public function destroy(Product $product)
    {
        $product->delete();
        return redirect()->route('admin.products.index')->with('success', 'Product deleted successfully.');
    }
}
