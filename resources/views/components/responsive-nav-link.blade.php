@props(['active'])

@php
$classes = ($active ?? false)
            ? 'block w-full ps-3 pe-4 py-2 border-l-4 border-pink-500 text-start text-base font-medium text-white bg-purple-500/20 focus:outline-none transition duration-150'
            : 'block w-full ps-3 pe-4 py-2 border-l-4 border-transparent text-start text-base font-medium text-gray-400 hover:text-white hover:bg-white/10 hover:border-purple-500 focus:outline-none focus:text-white focus:bg-white/10 focus:border-purple-500 transition duration-150';
@endphp

<a {{ $attributes->merge(['class' => $classes]) }}>
    {{ $slot }}
</a>
